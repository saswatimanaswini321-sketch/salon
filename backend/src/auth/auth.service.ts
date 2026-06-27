import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Create Admin User Auth
    const { data, error } = await this.supabase.db.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (error) throw new ConflictException(error.message);

    // 2. Create Admin Profile
    const { data: profile, error: profileError } = await this.supabase.db
      .from('profiles')
      .insert({ 
        id: data.user.id, 
        full_name: dto.name, 
        role: 'admin',
        store_name: dto.store_name,
        phone: dto.phone
      })
      .select()
      .single();
      
    if (profileError) throw new ConflictException(profileError.message);

    let createdSalonId: string | null = null;
    try {
      // 3. Create Salon (Store)
      const salon = await this.prisma.salon.create({
        data: {
          name: dto.store_name || 'My Salon',
          ownerId: data.user.id,
          ownerName: dto.name,
          email: dto.email,
          mobile: dto.phone,
          gstNumber: dto.store_gst,
          subscriptionId: dto.subscription_id,
          status: 'ACTIVE',
        }
      });
      createdSalonId = salon.id;

      // 4. Create Branch
      const branch = await this.prisma.branch.create({
        data: {
          salonId: salon.id,
          name: 'Main Branch',
          address: dto.store_address,
        }
      });
    } catch (dbError: any) {
      // Rollback: Delete the user from Supabase if DB creation fails
      await this.supabase.db.auth.admin.deleteUser(data.user.id);
      
      if (dbError.code === 'P2003' && dbError.meta?.constraint === 'Salon_subscriptionId_fkey') {
        throw new ConflictException('The selected subscription plan no longer exists. Please refresh the page to load the latest plans.');
      }
      throw new ConflictException('Failed to create store. Please try again.');
    }

    // 5. Create Staff User (if provided)
    if (dto.staff_email && dto.staff_password) {
      const { data: staffData, error: staffError } = await this.supabase.db.auth.admin.createUser({
        email: dto.staff_email,
        password: dto.staff_password,
        email_confirm: true,
      });

      if (!staffError && staffData.user) {
        await this.supabase.db.from('profiles').insert({
          id: staffData.user.id,
          full_name: dto.staff_name || 'Staff',
          role: 'barber',
          phone: dto.staff_phone,
          salon_id: createdSalonId
        });
      }
    }

    return profile;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.db.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fetch profile
    const { data: profile } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const payload = { sub: data.user.id, email: data.user.email, role: profile?.role ?? 'barber' };
    const token = this.jwt.sign(payload);

    return { access_token: token, user: profile || data.user };
  }

  async superAdminLogin(email: string) {
    if (email !== process.env.SUPER_ADMIN_EMAIL) {
      throw new UnauthorizedException('Not authorized as Super Admin');
    }
    const payload = { sub: 'super-admin-root', email, role: 'super_admin' };
    const token = this.jwt.sign(payload);
    return { access_token: token, user: { email, role: 'super_admin' } };
  }

  async getProfile(userId: string) {
    const { data } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }

  async getPublicSubscriptions() {
    return this.prisma.subscription.findMany();
  }

  async resetPassword(email: string, newPassword: string) {
    // Find user by email using admin API
    const { data: users, error } = await this.supabase.db.auth.admin.listUsers();
    if (error) throw new Error('Failed to find user');
    const user = users.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    // Update password via admin API
    const { error: updateError } = await this.supabase.db.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) throw new Error(updateError.message);
    return { success: true };
  }

  async checkUserExists(email: string): Promise<boolean> {
    const { data: users, error } = await this.supabase.db.auth.admin.listUsers();
    if (error) return false;
    return users.users.some(u => u.email === email);
  }
}
