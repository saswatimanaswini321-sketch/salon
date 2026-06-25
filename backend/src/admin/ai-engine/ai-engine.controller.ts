import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

// Basic Auth Guards (assuming they exist in your project based on other files)
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

export class UpdateSettingDto {
  @IsString()
  key: string;

  @IsString()
  @IsOptional()
  value: string;
}

export class UpdatePromptDto {
  @IsString()
  promptText: string;
}

export class GenerateImageDto {
  @IsString()
  salonId: string;

  @IsString()
  gender: string;

  @IsString()
  styleType: string;

  @IsString()
  styleName: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class UpdateUsageLimitsDto {
  @IsNumber()
  @IsOptional()
  dailyLimit?: number;

  @IsNumber()
  @IsOptional()
  monthlyLimit?: number;

  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;
}

@Controller('admin/ai')
// @UseGuards(JwtAuthGuard) - Uncomment when integrating full auth
export class AiEngineController {
  constructor(private readonly aiEngineService: AiEngineService) {}

  // ==========================================
  // AI SETTINGS / KEYS
  // ==========================================
  @Get('settings')
  async getSettings() {
    return this.aiEngineService.getSettings();
  }

  @Put('settings')
  async updateSetting(@Body() body: UpdateSettingDto) {
    return this.aiEngineService.updateSetting(body.key, body.value);
  }

  // ==========================================
  // AI PROMPTS
  // ==========================================
  @Get('prompts')
  async getPrompts() {
    return this.aiEngineService.getPrompts();
  }

  @Put('prompts/:type')
  async updatePrompt(@Param('type') type: string, @Body() body: UpdatePromptDto) {
    if (!body.promptText) {
      throw new HttpException('promptText required', HttpStatus.BAD_REQUEST);
    }
    return this.aiEngineService.updatePrompt(type, body.promptText);
  }

  // ==========================================
  // AI GENERATION (DEMO MOCK)
  // ==========================================
  @Post('generate')
  async generateMockImage(
    @Body() body: GenerateImageDto
  ) {
    if (!body.salonId || !body.styleType || !body.styleName) {
      throw new HttpException('salonId, styleType, and styleName are required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.aiEngineService.generateMockImage(body.salonId, body.gender, body.styleType, body.styleName, body.image);
    } catch (error: any) {
      console.error('generateMockImage Error:', error);
      // If it's already an HttpException, throw it directly
      if (error instanceof HttpException) {
        throw error;
      }
      // Otherwise expose the real error message
      throw new HttpException(
        error.message || 'Unknown internal error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==========================================
  // AI USAGE MANAGEMENT
  // ==========================================
  @Get('usage/:salonId')
  async getUsage(@Param('salonId') salonId: string) {
    return this.aiEngineService.getUsage(salonId);
  }

  @Put('usage/:salonId/limits')
  async updateUsageLimits(
    @Param('salonId') salonId: string, 
    @Body() body: UpdateUsageLimitsDto
  ) {
    return this.aiEngineService.updateUsageLimits(salonId, body);
  }
}
