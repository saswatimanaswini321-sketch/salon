import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { UpdateSystemConfigDto, UpdateWhiteLabelDto, UpdateCMSPageDto } from './dto/platform-settings.dto';

@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  // --- Environment Configuration ---

  @Get('config')
  async getAllConfigs() {
    return this.platformSettingsService.getAllSystemConfigs();
  }

  @Post('config')
  async updateConfig(@Body() body: UpdateSystemConfigDto) {
    await this.platformSettingsService.upsertSystemConfig(body.key, body.value, body.isEncrypted);
    return { success: true, message: 'Configuration updated successfully' };
  }

  // --- White Label Config ---

  @Get('salons')
  async getSalonsForDropdown() {
    return this.platformSettingsService.getSalonsForDropdown();
  }

  @Get('whitelabel/:salonId')
  async getWhiteLabel(@Param('salonId') salonId: string) {
    return this.platformSettingsService.getWhiteLabelConfig(salonId);
  }

  @Post('whitelabel/:salonId')
  async updateWhiteLabel(
    @Param('salonId') salonId: string,
    @Body() body: UpdateWhiteLabelDto,
  ) {
    return this.platformSettingsService.upsertWhiteLabelConfig(salonId, body);
  }

  // --- CMS Pages ---

  @Get('cms')
  async getAllCMSPages() {
    return this.platformSettingsService.getCMSPages();
  }

  @Get('cms/:pageName')
  async getCMSPage(@Param('pageName') pageName: string) {
    return this.platformSettingsService.getCMSPage(pageName);
  }

  @Post('cms')
  async updateCMSPage(@Body() body: UpdateCMSPageDto) {
    return this.platformSettingsService.upsertCMSPage(body.pageName, body.content);
  }
}
