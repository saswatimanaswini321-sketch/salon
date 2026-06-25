import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SupabaseService } from '../supabase/supabase.service';
import { SessionsService } from '../sessions/sessions.service';
import { ServicesService } from '../services/services.service';

interface AISuggestion {
  rank: number;
  style_name: string;
  description: string;
  compatibility_note: string;
  technique_tips: string;
}

interface AIResult {
  service: string;
  suggestions: AISuggestion[];
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
    private readonly sessions: SessionsService,
    private readonly servicesService: ServicesService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY') ?? 'placeholder',
    });
  }

  async generateSuggestions(sessionId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) throw new BadRequestException('Session not found');

    const services = await this.servicesService.findByIds(session.service_ids ?? []);
    const serviceNames = services.map((s: { name: string }) => s.name);

    const prompt = this.buildPrompt(session, serviceNames);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (session.photo_url) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: session.photo_url, detail: 'high' } },
        ],
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    let parsed: { results: AIResult[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('AI returned invalid JSON');
    }

    // Store suggestions in DB
    const allSuggestions: object[] = [];
    for (const result of parsed.results ?? []) {
      for (const suggestion of result.suggestions ?? []) {
        const { data } = await this.supabase.db
          .from('suggestions')
          .insert({
            session_id: sessionId,
            service_name: result.service,
            rank: suggestion.rank,
            style_name: suggestion.style_name,
            description: suggestion.description,
            compatibility_note: suggestion.compatibility_note,
            technique_tips: suggestion.technique_tips,
          })
          .select()
          .single();
        if (data) allSuggestions.push(data);
      }
    }

    // Mark session as completed
    await this.supabase.db
      .from('sessions')
      .update({ status: 'ai_complete', ai_raw_response: parsed })
      .eq('id', sessionId);

    return allSuggestions;
  }

  async generateDescription(gender: string, serviceIds: string[], photoUrl?: string, existingNotes?: string) {
    const services = await this.servicesService.findByIds(serviceIds);
    const serviceNames = services.map((s: { name: string }) => s.name);

    let prompt = `You are a professional salon AI consultant.
Customer gender: ${gender}
Selected services: ${serviceNames.join(', ')}

Analyze the customer photo (if provided) and the selected services.
Generate a concise, professional stylist notes description (2-3 sentences max) that details what specific style direction, hair texture focus, or face shape considerations the barber/stylist should prioritize.
Make it sound like a precise salon request or consultation note.
For example: "Wants a textured crop with a mid skin fade to suit their oval face shape. Keep the beard lined up and clean with natural cheek lines."
Do NOT include markdown, headings, prefixes like "Stylist notes:", or quotes. Return ONLY the plain text suggestion.`;

    if (existingNotes) {
      prompt += `\n\nCRITICAL INSTRUCTION: The user has already provided the following notes: "${existingNotes}". You MUST incorporate these notes into your generated description and expand on them professionally based on the photo and services.`;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (photoUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: photoUrl, detail: 'low' } },
        ],
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 150,
    });

    return { description: response.choices[0]?.message?.content?.trim() ?? '' };
  }


  private buildPrompt(session: { gender: string; description: string | null }, serviceNames: string[]): string {
    return `You are a professional salon AI consultant with expertise in hair, beauty, and grooming.
Customer gender: ${session.gender}
Barber/Stylist notes (USER INPUT): "${session.description ?? 'No specific notes provided'}"
${session.gender === 'men' ? 'This is a male client visiting a professional barber/salon.' : 'This is a female client visiting a professional salon.'}

CRITICAL INSTRUCTION: You MUST strictly follow the "Barber/Stylist notes (USER INPUT)". Tailor ALL 3 recommendations to accommodate the user's specific requests, face shape, hair type, and preferences mentioned in the notes. Do NOT ignore the notes. If the notes ask for a specific style (like "mullet", "low fade"), you must provide suggestions centered around that request.

Provide exactly 3 professional recommendations for EACH of these services: ${serviceNames.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "results": [
    {
      "service": "[Service Name]",
      "suggestions": [
        {
          "rank": 1,
          "style_name": "[Specific style name]",
          "description": "[2-3 sentence description of the style, tailored to this customer]",
          "compatibility_note": "[Why this style suits this customer based on their photo/features]",
          "technique_tips": "[Specific execution tips for the barber/stylist, 2-3 sentences]"
        }
      ]
    }
  ]
}

Be specific, professional, and practical. Tailor recommendations to an Indian salon/barbershop context. Do not include markdown, only raw JSON.`;
  }
}
