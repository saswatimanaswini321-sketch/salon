import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SuperAdminGuard } from '../../auth/super-admin.guard';

@Controller('admin/dashboard')
@UseGuards(SuperAdminGuard) // Protect dashboard stats with Super Admin Guard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('charts')
  async getCharts() {
    return this.dashboardService.getCharts();
  }
}
