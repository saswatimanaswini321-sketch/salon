import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class SuperAdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, run the standard JWT verification (which attaches req.user)
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      return false;
    }

    const req = context.switchToHttp().getRequest();
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (!superAdminEmail) {
      console.error('SUPER_ADMIN_EMAIL is not set in the environment variables');
      throw new UnauthorizedException('Super Admin configuration missing');
    }

    // Check if the authenticated user's email matches the SUPER_ADMIN_EMAIL
    if (req.user?.email !== superAdminEmail) {
      throw new UnauthorizedException('Access denied. Super Admin privileges required.');
    }

    return true;
  }
}
