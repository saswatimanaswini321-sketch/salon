import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async getMetrics() {
    // 1. Total Salons & Active Salons
    const totalSalons = await this.prisma.salon.count();
    const activeSalons = await this.prisma.salon.count({
      where: { status: 'ACTIVE' }
    });

    // 2. Customers & Barbers from Supabase Profiles (Customer excluded per user request -> return 0)
    // Wait, the user said exclude customers. I'll still fetch barbers.
    const { count: totalBarbers } = await this.supabase.db
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'barber');

    // 3. AI Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalConsultations = await this.prisma.aILog.count();
    const todaysAiRequests = await this.prisma.aILog.count({
      where: {
        createdAt: {
          gte: today,
        }
      }
    });

    // 4. API Cost (Calculate from APIUsage tokens * rate)
    const apiUsages = await this.prisma.aPIUsage.findMany();
    const totalTokens = apiUsages.reduce((sum, usage) => sum + usage.tokensUsed, 0);
    // Let's assume a rate of $0.002 per 1000 tokens for demonstration
    const apiCost = (totalTokens / 1000) * 0.002;

    // 5. Monthly Revenue (Calculate from Salons with Subscriptions)
    const activeSubscribedSalons = await this.prisma.salon.findMany({
      where: { status: 'ACTIVE', subscriptionId: { not: null } },
      include: { subscription: true }
    });
    const monthlyRevenue = activeSubscribedSalons.reduce((sum, salon) => {
      return sum + (salon.subscription?.price || 0);
    }, 0);

    // 6. Subscriptions
    const activeSubscriptions = activeSubscribedSalons.length;
    // We would calculate expiring plans by tracking subscription dates in a full implementation
    const expiringPlans = 0; 

    // Profit Margin Calculation (Simplified)
    const profitMargin = monthlyRevenue > 0 ? (((monthlyRevenue - apiCost) / monthlyRevenue) * 100).toFixed(1) + '%' : '0%';

    return {
      totalSalons,
      activeSalons,
      totalCustomers: 0, // Excluded for now per user request
      totalBarbers: totalBarbers || 0,
      totalConsultations,
      todaysAiRequests,
      monthlyRevenue,
      apiCost: Number(apiCost.toFixed(2)),
      profitMargin,
      activeSubscriptions,
      expiringPlans,
    };
  }

  async getCharts() {
    // Return structured dummy data for the charts for UI testing.
    // In production, these would be complex 'GROUP BY MONTH' raw SQL queries.
    return {
      revenueGrowth: [
        { month: 'Jan', amount: 5000 },
        { month: 'Feb', amount: 6200 },
        { month: 'Mar', amount: 8000 },
      ],
      aiUsageGrowth: [
        { month: 'Jan', calls: 12000 },
        { month: 'Feb', calls: 15500 },
        { month: 'Mar', calls: 21000 },
      ],
      customerGrowth: [
        { month: 'Jan', count: 1200 },
        { month: 'Feb', count: 1800 },
        { month: 'Mar', count: 2500 },
      ],
      salonGrowth: [
        { month: 'Jan', count: 10 },
        { month: 'Feb', count: 15 },
        { month: 'Mar', count: 22 },
      ],
      consultationTrends: [
        { month: 'Jan', count: 5000 },
        { month: 'Feb', count: 7000 },
        { month: 'Mar', count: 12000 },
      ],
    };
  }
}
