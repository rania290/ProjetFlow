import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './application/dto/login.dto';
import { RegisterDto } from './application/dto/register.dto';
import { type UserRepository } from '../users/domain/user-repository.interface';
import { UserRole } from '../users/domain/user-role.enum';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: UserRepository, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
        };
    }>;
}
