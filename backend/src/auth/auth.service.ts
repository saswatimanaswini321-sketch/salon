import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { SignupDto } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const { data, error } = await this.supabase.db.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (error) throw new ConflictException(error.message);

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

    return { access_token: token, user: profile };
  }

  async getProfile(userId: string) {
    const { data } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }
}
