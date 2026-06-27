import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { AdminService } from './admin.service';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() phone: string;
  @IsIn(['admin', 'barber']) role: 'admin' | 'barber';
}
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers(@Req() req: any) { return this.adminService.listUsers(req.user.sub); }

  @Post('users')
  createUser(@Req() req: any, @Body() dto: CreateUserDto) { return this.adminService.createUser(req.user.sub, dto); }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) { return this.adminService.deleteUser(id); }

  @Get('salon')
  getSalon(@Req() req: any) { return this.adminService.getSalonDetails(req.user.sub); }

  @Post('salon')
  updateSalon(@Req() req: any, @Body() body: { name?: string; address?: string; gstNo?: string }) {
    return this.adminService.updateSalon(req.user.sub, body);
  }

  @Post('branches')
  addBranch(@Req() req: any, @Body() body: { name: string, address?: string }) { 
    return this.adminService.addBranch(req.user.sub, body); 
  }
}
