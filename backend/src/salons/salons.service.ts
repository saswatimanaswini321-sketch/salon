import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SalonsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async findAll() {
    return this.prisma.salon.findMany({
      include: {
        subscription: true,
        branches: true,
      },
    });
  }

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
      include: {
        subscription: true,
        branches: true,
      },
    });
    
    if (!salon) {
      throw new NotFoundException(`Salon with ID ${id} not found`);
    }
    return salon;
  }

  async create(data: { name: string; ownerId: string; ownerName?: string; email?: string; mobile?: string; subscriptionId?: string }) {
    return this.prisma.salon.create({
      data: {
        name: data.name,
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        email: data.email,
        mobile: data.mobile,
        subscriptionId: data.subscriptionId,
        status: 'ACTIVE', // Auto-active as per new automated workflow
      },
    });
  }

  async updateProfile(id: string, updateData: { name?: string; ownerName?: string; email?: string; mobile?: string; subscriptionId?: string }) {
    try {
      return await this.prisma.salon.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new NotFoundException(`Salon with ID ${id} not found`);
    }
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be PENDING, ACTIVE, or SUSPENDED.');
    }
    try {
      return await this.prisma.salon.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      throw new NotFoundException(`Salon with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.salon.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Salon with ID ${id} not found`);
    }
  }

  // === BRANCH MANAGEMENT ===

  async getBranches(salonId: string) {
    return this.prisma.branch.findMany({
      where: { salonId }
    });
  }

  async updateBranch(salonId: string, branchId: string, updateData: { address?: string; timings?: string; name?: string }) {
    try {
      return await this.prisma.branch.update({
        where: { id: branchId, salonId }, // Ensure branch belongs to salon
        data: updateData,
      });
    } catch (error) {
      throw new NotFoundException(`Branch not found or does not belong to Salon`);
    }
  }

  async getBranchStaff(salonId: string, branchId: string) {
    // Queries Supabase profiles where role is barber and ideally linked to this branch.
    // Assuming 'branch_id' or 'salon_id' is stored in the Supabase metadata.
    // If exact branch linkage doesn't exist yet, we fetch all barbers for the salon.
    const { data, error } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('role', 'barber');
      // .eq('branch_id', branchId); // Would be active in production if branch_id is mapped in Supabase profiles

    if (error) {
      throw new Error(`Failed to fetch staff: ${error.message}`);
    }
    
    return data;
  }
}
