import { UserRole } from '../../../users/domain/user-role.enum';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}
