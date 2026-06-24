import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subscription.findMany();
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async update(id: string, data: any) {
    // Only allow updating specific fields
    const { price, barberLimit, aiLimit } = data;
    
    try {
      return await this.prisma.subscription.update({
        where: { id },
        data: {
          price: price !== undefined ? Number(price) : undefined,
          barberLimit: barberLimit !== undefined ? Number(barberLimit) : undefined,
          aiLimit: aiLimit !== undefined ? Number(aiLimit) : undefined,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  // Initial seeder method (optional, for convenience)
  async seedPlans() {
    const defaultPlans = [
      { name: 'Free', price: 0.0, barberLimit: 2, aiLimit: 20 },
      { name: 'Starter', price: 29.0, barberLimit: 5, aiLimit: 100 },
      { name: 'Premium', price: 99.0, barberLimit: 20, aiLimit: 1000 },
      { name: 'Enterprise', price: 299.0, barberLimit: 9999, aiLimit: 99999 },
    ];

    for (const plan of defaultPlans) {
      await this.prisma.subscription.upsert({
        where: { name: plan.name },
        update: {}, // Don't override if exists
        create: plan,
      });
    }
    
    return { message: 'Default plans seeded successfully' };
  }
}
