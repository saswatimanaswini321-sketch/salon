import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'barber';
}

@Injectable()
export class AdminService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService
  ) {}

  async createUser(adminId: string, dto: CreateUserDto) {
    // Get the admin's salon
    const salon = await this.prisma.salon.findFirst({ where: { ownerId: adminId } });
    const salonId = salon ? salon.id : null;

    // Create auth user
    const { data, error } = await this.supabase.db.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (error) throw new ConflictException(error.message);

    // Create profile
    const { data: profile, error: profileError } = await this.supabase.db
      .from('profiles')
      .insert({ id: data.user.id, full_name: dto.name, role: dto.role, phone: (dto as any).phone, salon_id: salonId })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to insert profile:', profileError);
    }

    return profile;
  }

  async listUsers(adminId: string) {
    // Get the admin's salon
    const salon = await this.prisma.salon.findFirst({ where: { ownerId: adminId } });
    if (!salon) return [];

    // Fetch profiles that belong to this salon or are the admin
    const { data } = await this.supabase.db
      .from('profiles')
      .select('*')
      .or(`salon_id.eq.${salon.id},id.eq.${adminId}`)
      .order('created_at', { ascending: false });
    
    return data ?? [];
  }

  async deleteUser(id: string) {
    await this.supabase.db.auth.admin.deleteUser(id);
    await this.supabase.db.from('profiles').delete().eq('id', id);
    return { success: true };
  }

  async getSalonDetails(ownerId: string) {
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId },
      include: { branches: true, subscription: true, apiUsage: true },
    });
    if (!salon) throw new NotFoundException('Salon not found');
    return salon;
  }

  async addBranch(ownerId: string, data: { name: string; address?: string }) {
    const salon = await this.prisma.salon.findFirst({ where: { ownerId } });
    if (!salon) throw new NotFoundException('Salon not found');
    return this.prisma.branch.create({
      data: { salonId: salon.id, name: data.name, address: data.address },
    });
  }
}
