import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest')
  suggest(@Body() body: { session_id: string }) {
    return this.aiService.generateSuggestions(body.session_id);
  }

  @Post('generate-description')
  generateDescription(
    @Body() body: { gender: string; service_ids: string[]; photo?: string; description?: string },
  ) {
    return this.aiService.generateDescription(
      body.gender,
      body.service_ids,
      body.photo,
      body.description,
    );
  }
}
