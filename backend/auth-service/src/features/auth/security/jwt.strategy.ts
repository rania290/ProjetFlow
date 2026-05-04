import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from '../constants/auth.constants';
import { UserRole } from '../../users/constants/users.constants';

import { UsersService } from '../../users/service/users.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          let token: string | null = null;
          if (req && (req as any).cookies) {
            token = (req as any).cookies[ACCESS_TOKEN_COOKIE_NAME];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Session expirée ou utilisateur inexistant');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      fullName: (user as any).fullName,
      managerIds: (user as any).managerIds || [],
      department: (user as any).department,
      profilePhoto: (user as any).profilePhoto,
    };
  }
}

