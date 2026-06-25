import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PlatformSettingsService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // In production, this should be a 32-byte key from env
    const rawKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default_secret_key_needs_32_bytes';
    // Ensure key is exactly 32 bytes
    this.key = crypto.scryptSync(rawKey, 'salt', 32);
  }

  // --- Environment Configuration (SystemConfig) ---

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (e) {
      return ''; // Handle error silently for now, returning empty string if decryption fails
    }
  }

  async getAllSystemConfigs() {
    const configs = await this.prisma.systemConfig.findMany();
    // Decrypt encrypted values before sending to frontend, but usually we don't send raw passwords.
    // For a settings panel, we might mask it. For this MVP, we return a masked string if encrypted.
    return configs.map(config => {
      if (config.isEncrypted && config.value) {
        return { ...config, value: '********' }; // Masked to client
      }
      return config;
    });
  }

  async upsertSystemConfig(key: string, value: string, isEncrypted: boolean) {
    let finalValue = value;
    if (isEncrypted && value !== '********') {
      finalValue = this.encrypt(value);
    } else if (isEncrypted && value === '********') {
      // Ignore update if it's just the mask
      return;
    }

    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value: finalValue, isEncrypted },
      create: { key, value: finalValue, isEncrypted },
    });
  }

  // --- White Label Config ---

  async getWhiteLabelConfig(salonId: string) {
    return this.prisma.whiteLabelConfig.findUnique({
      where: { salonId },
    });
  }

  // Fetch basic salon details for the Super Admin dropdown
  async getSalonsForDropdown() {
    return this.prisma.salon.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async upsertWhiteLabelConfig(salonId: string, data: { domain?: string; logoUrl?: string; primaryColor?: string; secondaryColor?: string }) {
    try {
      return await this.prisma.whiteLabelConfig.upsert({
        where: { salonId },
        update: data,
        create: { salonId, ...data },
      });
    } catch (error) {
      // If foreign key constraint fails (salon doesn't exist), create a dummy salon for MVP testing
      if (error.code === 'P2003') {
        await this.prisma.salon.create({
          data: {
            id: salonId,
            name: 'Dummy MVP Salon',
            ownerId: 'dummy-owner-id', // Assuming string is allowed
          }
        });
        // Retry the upsert
        return await this.prisma.whiteLabelConfig.upsert({
          where: { salonId },
          update: data,
          create: { salonId, ...data },
        });
      }
      throw error;
    }
  }

  // --- CMS Pages ---

  async getCMSPages() {
    return this.prisma.cMSPage.findMany();
  }

  async getCMSPage(pageName: string) {
    return this.prisma.cMSPage.findUnique({
      where: { pageName },
    });
  }

  async upsertCMSPage(pageName: string, content: any) {
    return this.prisma.cMSPage.upsert({
      where: { pageName },
      update: { content },
      create: { pageName, content },
    });
  }
}
