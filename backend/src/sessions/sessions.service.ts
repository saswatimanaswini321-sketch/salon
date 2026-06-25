import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ClientsService } from '../clients/clients.service';

export interface CreateSessionDto {
  client_id?: string;
  barber_id: string;
  gender: string;
  service_ids: string[];
  description?: string;
  photo_url?: string;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly clients: ClientsService,
  ) {}

  async create(dto: CreateSessionDto) {
    const { data, error } = await this.supabase.db
      .from('sessions')
      .insert({
        client_id: dto.client_id ?? null,
        barber_id: dto.barber_id,
        gender: dto.gender,
        service_ids: dto.service_ids,
        description: dto.description ?? null,
        photo_url: dto.photo_url ?? null,
        status: 'pending',
        ar_ready: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (dto.client_id) await this.clients.updateLastVisit(dto.client_id);
    return data;
  }

  private async signSessions(sessions: any[]) {
    for (const session of sessions) {
      if (session.photo_url && !session.photo_url.startsWith('http')) {
        const { data, error } = await this.supabase.db.storage
          .from('customer-photos')
          .createSignedUrl(session.photo_url, 3600); // 1 hour expiry
        if (!error && data) {
          session.photo_url = data.signedUrl;
        }
      }
    }
    return sessions;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.db
      .from('sessions')
      .select('*, client:clients(*), suggestions(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    const [signed] = await this.signSessions([data]);
    return signed;
  }

  async findByBarber(barberId: string, page = 1, limit = 20) {
    const { data, count, error } = await this.supabase.db
      .from('sessions')
      .select('*, client:clients(name, phone)', { count: 'exact' })
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw new Error(error.message);
    
    const signedData = await this.signSessions(data ?? []);
    return { data: signedData, total: count ?? 0 };
  }

  async findAll(page = 1, limit = 20) {
    const { data, count, error } = await this.supabase.db
      .from('sessions')
      .select('*, client:clients(name, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw new Error(error.message);
    
    const signedData = await this.signSessions(data ?? []);
    return { data: signedData, total: count ?? 0 };
  }

  async selectSuggestion(sessionId: string, suggestionId: string) {
    const { data, error } = await this.supabase.db
      .from('sessions')
      .update({ selected_suggestion_id: suggestionId, status: 'completed' })
      .eq('id', sessionId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async uploadPhoto(sessionId: string, file: Express.Multer.File): Promise<string> {
    const fileName = `sessions/${sessionId}/${Date.now()}.jpg`;
    const { error } = await this.supabase.db.storage
      .from('customer-photos')
      .upload(fileName, file.buffer, { contentType: file.mimetype });
    if (error) throw new Error(error.message);
    
    // Update the DB row
    const { error: updateError } = await this.supabase.db
      .from('sessions')
      .update({ photo_url: fileName })
      .eq('id', sessionId);
    if (updateError) throw new Error(updateError.message);
    
    // We return the raw filename path. The DB saves this.
    // When fetching, createSignedUrl will generate the secure link.
    return fileName;
  }
}
