import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { PublicSubscriptionsController } from './public-subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionsController, PublicSubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
