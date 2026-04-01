import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth.service';
import type { LoginDto, RegisterUserDto } from '../types/auth.types';

interface UserProfile {
    id?: string;
    fullName: string;
    email?: string;
    role: string;
    department?: string;
    location?: string;
    phone?: string;
    bio?: string;
    institution?: string;
    domain?: string;
    profilePhoto?: string;
    preferredLanguage?: 'fr' | 'en';
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserProfile | null;
    login: (dto: LoginDto) => Promise<UserProfile>;
    register: (dto: RegisterUserDto) => Promise<void>;
    googleLogin: (credential: string) => Promise<UserProfile>;
    logout: () => Promise<void>;
    updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            // Ajouter un petit délai pour éviter les flickers
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAuthenticated(false);
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const response = await authService.me();
                setIsAuthenticated(true);

                setUser({
                    id: (response as any).id || (response as any)._id,
                    fullName: response.fullName || 'Utilisateur',
                    email: response.email,
                    role: response.role || 'TEAM_MEMBER',
                    department: (response as any).department,
                    location: (response as any).location,
                    phone: (response as any).phone,
                    bio: (response as any).bio,
                    institution: (response as any).institution,
                    domain: (response as any).domain,
                    profilePhoto: (response as any).profilePhoto,
                    preferredLanguage: (response as any).preferredLanguage,
                });
            } catch (error) {
                console.log('Auth check failed:', error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        void checkAuth();
    }, []);

    const login = async (dto: LoginDto) => {
        const response = await authService.login(dto);
        localStorage.setItem('token', response.accessToken);
        setIsAuthenticated(true);
        const loggedInUser = {
            id: (response.user as any).id || (response.user as any)._id,
            fullName: response.user?.fullName || 'Utilisateur',
            email: response.user?.email,
            role: response.user?.role || 'TEAM_MEMBER',
            profilePhoto: (response.user as any).profilePhoto,
        };
        setUser(loggedInUser);
        return loggedInUser;
    };

    const register = async (dto: RegisterUserDto) => {
        await authService.register(dto);
    };

    const googleLogin = async (credential: string) => {
        const response = await authService.googleLogin(credential);
        localStorage.setItem('token', response.accessToken);
        setIsAuthenticated(true);
        const loggedInUser = {
            id: (response.user as any).id || (response.user as any)._id,
            fullName: response.user?.fullName || 'Utilisateur',
            email: response.user?.email,
            role: response.user?.role || 'TEAM_MEMBER',
            profilePhoto: (response.user as any).profilePhoto,
        };
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = async () => {
        await authService.logout();
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    const updateProfile = (profile: Partial<UserProfile>) => {
        setUser(prev => prev ? { ...prev, ...profile } : { fullName: 'Utilisateur', role: 'TEAM_MEMBER', ...profile });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, googleLogin, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
