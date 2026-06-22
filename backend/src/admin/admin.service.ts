import { Injectable, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'barber';
}

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async createUser(dto: CreateUserDto) {
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
      .insert({ id: data.user.id, full_name: dto.name, role: dto.role, phone: (dto as any).phone })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to insert profile:', profileError);
    }

    return profile;
  }

  async listUsers() {
    const { data } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('role', 'barber')
      .order('created_at', { ascending: false });
    return data ?? [];
  }

  async deleteUser(id: string) {
    await this.supabase.db.auth.admin.deleteUser(id);
    await this.supabase.db.from('profiles').delete().eq('id', id);
    return { success: true };
  }
}
