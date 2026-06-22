import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
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
  listUsers() { return this.adminService.listUsers(); }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) { return this.adminService.createUser(dto); }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) { return this.adminService.deleteUser(id); }
}
