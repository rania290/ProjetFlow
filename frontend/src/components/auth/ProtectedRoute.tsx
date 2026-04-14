import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Définition des permissions par rôle
export const ROLE_PERMISSIONS = {
  ADMIN: [
    'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_USER',
    'READ_PROJECT', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT', 'ASSIGN_PROJECT',
    'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'ASSIGN_TASK', 'COMPLETE_TASK',
    'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET', 'ASSIGN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE', 'CREATE_CHANNEL',
    'READ_ANALYTICS', 'EXPORT_DATA', 'VIEW_ADMIN_PANEL',
    'READ_HR', 'MANAGE_HR', 'APPROVE_LEAVE', 'REJECT_LEAVE'
  ],
  PROJECT_MANAGER: [
    'READ_USER', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
    'READ_PROJECT', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'ASSIGN_PROJECT',
    'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'ASSIGN_TASK', 'COMPLETE_TASK',
    'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET', 'ASSIGN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE', 'CREATE_CHANNEL',
    'READ_ANALYTICS', 'EXPORT_DATA',
    'READ_HR', 'APPROVE_LEAVE', 'REJECT_LEAVE'
  ],
  TEAM_MEMBER: [
    'READ_TASK', 'UPDATE_OWN_TASK', 'COMPLETE_OWN_TASK',
    'READ_TICKET', 'UPDATE_OWN_TICKET', 'DELETE_OWN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE',
    'READ_HR', 'CREATE_LEAVE', 'READ_OWN_LEAVE'
  ],
  HR_ADMIN: [
    'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_USER',
    'READ_PROJECT', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT', 'ASSIGN_PROJECT',
    'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'ASSIGN_TASK', 'COMPLETE_TASK',
    'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET', 'ASSIGN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE', 'CREATE_CHANNEL', 'MANAGE_CHANNELS',
    'READ_ANALYTICS', 'EXPORT_DATA', 'VIEW_ADMIN_PANEL',
    'READ_HR', 'MANAGE_HR', 'APPROVE_LEAVE', 'REJECT_LEAVE', 'CREATE_LEAVE'
  ],
  MANAGER: [
    'READ_USER', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
    'READ_PROJECT', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'ASSIGN_PROJECT',
    'CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'ASSIGN_TASK', 'COMPLETE_TASK',
    'CREATE_TICKET', 'READ_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET', 'ASSIGN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE', 'CREATE_CHANNEL',
    'READ_ANALYTICS', 'EXPORT_DATA',
    'READ_HR', 'APPROVE_LEAVE', 'REJECT_LEAVE', 'CREATE_LEAVE'
  ],
  EMPLOYEE: [
    'READ_TASK', 'UPDATE_OWN_TASK', 'COMPLETE_OWN_TASK',
    'READ_TICKET', 'UPDATE_OWN_TICKET', 'DELETE_OWN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE',
    'READ_HR', 'CREATE_LEAVE', 'READ_OWN_LEAVE'
  ],
  CLIENT: [
    'READ_OWN_PROJECT', 'READ_OWN_TASK', 'READ_OWN_TICKET',
    'SEND_MESSAGE', 'READ_MESSAGE'
  ],
  OBSERVER: [
    'READ_PROJECT', 'READ_TASK', 'READ_TICKET', 'READ_ANALYTICS'
  ]
};

// Niveaux de rôle pour la hiérarchie
export const ROLE_LEVELS = {
  ADMIN: 100,
  PROJECT_MANAGER: 80,
  TEAM_MEMBER: 60,
  HR_ADMIN: 70,
  MANAGER: 75,
  EMPLOYEE: 50,
  CLIENT: 40,
  OBSERVER: 20
};

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string | string[];
    requiredPermission?: string | string[];
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredRole, 
    requiredPermission,
    redirectTo = '/dashboard' 
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Si on est déjà sur la page de login, ne pas rediriger
    if (location.pathname === '/login' || location.pathname === '/onboarding') {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the attempted path to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérification des rôles
    if (requiredRole && user) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            return <Navigate to={redirectTo} replace />;
        }
    }

    // Vérification des permissions
    if (requiredPermission && user) {
        const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
        const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        
        const hasPermission = permissions.some(permission => 
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return <Navigate to="/403" replace />;
        }
    }

    return <>{children}</>;
};

// Hook pour vérifier les permissions
export const usePermissions = () => {
    const { user } = useAuth();
    
    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        
        const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        return userPermissions.includes(permission);
    };
    
    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user) return false;
        
        const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        return permissions.some(permission => userPermissions.includes(permission));
    };
    
    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user) return false;
        
        const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        return permissions.every(permission => userPermissions.includes(permission));
    };
    
    const canAccess = (requiredRole?: string | string[], requiredPermission?: string | string[]): boolean => {
        if (!user) return false;
        
        // Vérification des rôles
        if (requiredRole) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!roles.includes(user.role)) return false;
        }
        
        // Vérification des permissions
        if (requiredPermission) {
            const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
            const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
            
            if (!permissions.some(permission => userPermissions.includes(permission))) {
                return false;
            }
        }
        
        return true;
    };
    
    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccess,
        userRole: user?.role,
        userPermissions: user ? ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] : []
    };
};
