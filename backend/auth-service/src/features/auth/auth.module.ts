import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { User } from '../users/model/users.model';
import { CookieService } from './security/cookie.service';
import { JwtStrategy } from './security/jwt.strategy';
import { RolesGuard } from './security/roles.guard';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/service/users.service';
import { UsersController } from '../users/controller/users.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, CookieService, JwtStrategy, RolesGuard, Reflector, UsersService],
  exports: [AuthService, CookieService, RolesGuard, UsersService],
})
export class AuthModule {}

