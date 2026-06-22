import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  // In-memory OTP store: email -> { otp, expiresAt }
  private otpStore = new Map<string, OtpRecord>();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: parseInt(process.env.SMTP_PORT || '465') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  generateOtp(): string {
    // Generate exactly 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOtp(email: string, otp: string): void {
    this.otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
  }

  verifyOtp(email: string, otp: string): boolean {
    const record = this.otpStore.get(email.toLowerCase());
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email.toLowerCase());
      return false;
    }
    if (record.otp !== otp) return false;
    // Delete after successful verification (one-time use)
    this.otpStore.delete(email.toLowerCase());
    return true;
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    console.log(`[MailService] Sending OTP to ${email} via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`[MailService] SMTP_USER=${process.env.SMTP_USER}`);
    console.log(`[MailService] SMTP_FROM=${process.env.SMTP_FROM}`);
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"AI Salon" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your AI Salon Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 12px;">
            <h2 style="color: #c9a84c; margin-bottom: 8px;">AI Salon</h2>
            <h3 style="color: #ffffff; margin-bottom: 24px;">Password Reset Request</h3>
            <p style="color: #aaaaaa; margin-bottom: 24px;">Use the 6-digit code below to reset your password. This code expires in <strong>10 minutes</strong>.</p>
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #c9a84c;">${otp}</span>
            </div>
            <p style="color: #666666; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`[MailService] ✅ OTP email sent successfully to ${email}`);
    } catch (err) {
      console.error(`[MailService] ❌ Failed to send email:`, err);
      throw new Error(`Email send failed: ${(err as any).message}`);
    }
  }
}
