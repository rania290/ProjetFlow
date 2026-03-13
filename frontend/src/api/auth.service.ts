import api from './api-client';
import type { LoginDto, RegisterUserDto, AuthResponse, User } from '../types/auth.types';

export const authService = {
    async login(dto: LoginDto): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', dto);
        return response.data;
    },

    async register(dto: RegisterUserDto): Promise<void> {
        await api.post('/auth/register', dto);
    },

    async googleLogin(credential: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/google-token', { credential });
        return response.data;
    },

    async me(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },
};
