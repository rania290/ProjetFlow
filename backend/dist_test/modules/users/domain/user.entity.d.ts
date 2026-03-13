import { UserRole } from './user-role.enum';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: string, email: string, passwordHash: string, fullName: string, role: UserRole, createdAt: Date, updatedAt: Date);
}
