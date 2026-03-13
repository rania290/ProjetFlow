import type { Request, Response } from 'express';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { AuthService } from '../../auth.service';
import { CookieService } from '../security/cookie.service';
import { UserRole } from '../../../users/domain/user-role.enum';
export declare class AuthController {
    private readonly authService;
    private readonly cookieService;
    constructor(authService: AuthService, cookieService: CookieService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: UserRole;
        };
    }>;
    me(req: any): Promise<any>;
}
