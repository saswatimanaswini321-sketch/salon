import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, MinLength, IsOptional, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message: 'Password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password: string;
}

export class SignupDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  store_name?: string;

  @IsString()
  @IsOptional()
  store_address?: string;

  @IsString()
  @IsOptional()
  store_gst?: string;

  @IsString()
  @IsOptional()
  subscription_id?: string;

  @IsString()
  @IsOptional()
  billing_cycle?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message: 'Password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password: string;

  // Staff details
  @IsString()
  @IsOptional()
  staff_name?: string;

  @IsString()
  @IsOptional()
  staff_email?: string;

  @IsString()
  @IsOptional()
  staff_phone?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message: 'Staff password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  staff_password?: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message: 'New password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  newPassword: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const otp = this.mailService.generateOtp();
    this.mailService.storeOtp(dto.email, otp);
    await this.mailService.sendOtpEmail(dto.email, otp);
    return { message: 'OTP sent successfully' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const valid = this.mailService.verifyOtp(dto.email, dto.otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP. Please request a new one.');
    await this.authService.resetPassword(dto.email, dto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('super-admin/request-otp')
  async superAdminRequestOtp(@Body() dto: ForgotPasswordDto) {
    if (dto.email !== process.env.SUPER_ADMIN_EMAIL) {
      throw new BadRequestException('Not authorized as Super Admin');
    }
    const otp = this.mailService.generateOtp();
    this.mailService.storeOtp(dto.email, otp);
    await this.mailService.sendOtpEmail(dto.email, otp);
    return { message: 'OTP sent successfully to Super Admin' };
  }

  @Post('super-admin/verify-otp')
  async superAdminVerifyOtp(@Body() dto: VerifyOtpDto) {
    const valid = this.mailService.verifyOtp(dto.email, dto.otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP.');
    return this.authService.superAdminLogin(dto.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }

  @Get('subscriptions')
  getPublicSubscriptions() {
    return this.authService.getPublicSubscriptions();
  }
}
