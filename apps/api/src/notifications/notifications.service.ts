import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendNotificationDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  send(dto: SendNotificationDto) {
    return this.prisma.notificationLog.create({
      data: {
        userId: dto.userId,
        channel: dto.channel,
        template: dto.template,
        payload: dto.payload,
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
  }

  listForUser(userId: string) {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
