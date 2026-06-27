import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationsService, CreateNotificationDto } from './notifications.service';
import { CronService } from './cron.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly cronService: CronService
  ) {}

  private async getSalonId(req: any): Promise<string> {
    // If authenticated, find the salon owned by the user (ownerId = req.user.sub)
    if (req.user?.sub) {
      const salon = await this.notificationsService['prisma'].salon.findFirst({
        where: { ownerId: req.user.sub },
      });
      if (salon) return salon.id;
    }
    // Fallback: If not authenticated or no salon found, look up the first salon in DB
    const firstSalon = await this.notificationsService['prisma'].salon.findFirst();
    return firstSalon ? firstSalon.id : 'TEST_SALON_ID';
  }

  @Get('test-cron')
  async triggerTestCron() {
    return this.cronService.triggerTestCron();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: any) {
    const salonId = await this.getSalonId(req); 
    return this.notificationsService.findAll(salonId);
  }

  @Post()
  async createNotification(@Body() createDto: CreateNotificationDto) {
    if (createDto.salonId === 'TEST_SALON_ID') {
      const firstSalon = await this.notificationsService['prisma'].salon.findFirst();
      if (firstSalon) {
        createDto.salonId = firstSalon.id;
      }
    }
    return this.notificationsService.create(createDto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const salonId = await this.getSalonId(req);
    return this.notificationsService.markAsRead(id, salonId);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: any) {
    const salonId = await this.getSalonId(req);
    return this.notificationsService.markAllAsRead(salonId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    const salonId = await this.getSalonId(req);
    return this.notificationsService.delete(id, salonId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteAllNotifications(@Req() req: any) {
    const salonId = await this.getSalonId(req);
    return this.notificationsService.deleteAll(salonId);
  }

  // Super Admin: Broadcast festival offer or renewal reminder to one or all salons
  @Post('broadcast')
  async broadcastOffer(@Body() body: { salonId: string; type: any; title: string; message: string }) {
    return this.notificationsService.broadcastOffer(body.salonId, body.type, body.title, body.message);
  }
}
