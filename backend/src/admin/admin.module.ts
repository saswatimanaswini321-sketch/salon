import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [DashboardModule],
})
export class AdminModule {}
