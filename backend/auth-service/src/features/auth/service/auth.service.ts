import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/service/users.service';
import { User } from '../../users/model/users.model';
import { UserRole } from '../../users/constants/users.constants';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.createAdminAccount();
  }

  private async createAdminAccount() {
    const adminEmail = 'admin@vaerdia.com';
    const adminPassword = 'admin123';

    console.log('🔍 Vérification du compte admin...');

    const existingAdmin = await this.usersService.findByEmail(adminEmail);
    if (!existingAdmin) {
      console.log('✅ Création du compte admin fixe...');

      const admin = await this.usersService.create({
        email: adminEmail,
        password: adminPassword,
        fullName: 'Administrator',
        role: UserRole.ADMIN,
      });

      console.log('✅ Compte admin créé avec succès:', admin.email);
    } else {
      console.log('✅ Compte admin existe déjà:', adminEmail);
    }
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      role: dto.role || UserRole.DEVELOPER,
    });

    return this.sanitizeUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      dto.password,
      (user as any).password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user as any),
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: (user as any).id,
        email: (user as any).email,
        role: (user as any).role,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: this.sanitizeUser(user as any),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user as any;
    return sanitizedUser;
  }
}

