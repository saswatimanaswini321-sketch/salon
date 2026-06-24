import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { ClientsModule } from './clients/clients.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SalonsModule } from './salons/salons.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    ServicesModule,
    ClientsModule,
    SessionsModule,
    AiModule,
    AnalyticsModule,
    AdminModule,
    SalonsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
