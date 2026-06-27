import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  salonId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(salonId: string) {
    return this.prisma.notification.findMany({
      where: { salonId },
      orderBy: { createdAt: 'desc' },
      take: 50, // limit to 50 most recent
    });
  }

  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        salonId: data.salonId,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, salonId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, salonId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(salonId: string) {
    return this.prisma.notification.updateMany({
      where: { salonId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, salonId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, salonId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAll(salonId: string) {
    return this.prisma.notification.deleteMany({
      where: { salonId },
    });
  }

  // Super Admin: Send festival offer or renewal reminder to one salon or all salons
  async broadcastOffer(salonId: string | 'ALL', type: NotificationType, title: string, message: string) {
    if (salonId === 'ALL') {
      const salons = await this.prisma.salon.findMany({ select: { id: true } });
      const notifications = salons.map(salon =>
        this.prisma.notification.create({
          data: { salonId: salon.id, type, title, message, isRead: false },
        })
      );
      return Promise.all(notifications);
    } else {
      return this.prisma.notification.create({
        data: { salonId, type, title, message, isRead: false },
      });
    }
  }
}
