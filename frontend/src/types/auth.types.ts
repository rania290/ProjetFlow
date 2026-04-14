export const UserRole = {
    ADMIN: 'ADMIN',
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    DEVELOPER: 'DEVELOPER',
    DESIGNER: 'DESIGNER',
    CLIENT: 'CLIENT',
    RH: 'RH',
    AURA_AI: 'AURA_AI',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface RegisterUserDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    fullName?: string;
    role: UserRole;
    isActive?: boolean;
    managerId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    message: string;
    accessToken: string;
    refreshToken?: string;
    user: User;
}
