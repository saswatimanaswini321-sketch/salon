import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, MinLength, IsOptional, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
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
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
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
  @MinLength(8)
  newPassword: string;
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }
}
