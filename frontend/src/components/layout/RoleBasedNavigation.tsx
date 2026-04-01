import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePermissions } from '../auth/ProtectedRoute';
import {
  Home,
  Briefcase,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Eye,
  MessageSquare,
  Calendar,
  Target,
  UserPlus,
  Database
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: string;
  requiredRole?: string | string[];
  badge?: string;
}

export const RoleBasedNavigation: React.FC = () => {
  const { hasPermission } = usePermissions();
  const location = useLocation();

  const navigationItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      requiredPermission: 'READ_TASK'
    },
    {
      name: 'Projets',
      href: '/projects',
      icon: Briefcase,
      requiredPermission: 'READ_PROJECT'
    },
    {
      name: 'Tâches',
      href: '/tasks',
      icon: Target,
      requiredPermission: 'READ_TASK'
    },
    {
      name: 'Équipe',
      href: '/team',
      icon: Users,
      requiredPermission: 'READ_USER'
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      requiredPermission: 'READ_MESSAGE'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      requiredPermission: 'READ_ANALYTICS'
    },
    {
      name: 'Tickets',
      href: '/tickets',
      icon: FileText,
      requiredPermission: 'READ_TICKET'
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      requiredPermission: 'VIEW_ADMIN_PANEL',
      requiredRole: ['ADMIN', 'ROOT']
    },

    {
      name: 'Paramètres',
      href: '/settings',
      icon: Settings,
      requiredPermission: 'MANAGE_SYSTEM',
      requiredRole: ['ROOT']
    }
  ];

  // Filtrer les éléments de navigation selon les permissions
  const filteredNavItems = navigationItems.filter(item => {
    // Si l'élément nécessite une permission spécifique
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission);
    }
    
    // Si l'élément nécessite un rôle spécifique
    if (item.requiredRole) {
      const roles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
      return roles.some(role => hasPermission(`ROLE_${role}`));
    }
    
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-primary-100 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

// Composant pour afficher les actions rapides selon le rôle
export const RoleBasedQuickActions: React.FC = () => {
  const { hasPermission } = usePermissions();

  const quickActions = [
    {
      name: 'Créer un projet',
      icon: Briefcase,
      href: '/projects/new',
      permission: 'CREATE_PROJECT',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Créer une tâche',
      icon: Target,
      href: '/tasks/new',
      permission: 'CREATE_TASK',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Ajouter un utilisateur',
      icon: UserPlus,
      href: '/admin/users/new',
      permission: 'CREATE_USER',
      color: 'bg-purple-500 hover:bg-purple-600'
    },

    {
      name: 'Voir les analytics',
      icon: BarChart3,
      href: '/analytics',
      permission: 'READ_ANALYTICS',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  const availableActions = quickActions.filter(action => 
    hasPermission(action.permission)
  );

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Actions rapides
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {availableActions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.name}
              href={action.href}
              className={`${action.color} text-white rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium transition-colors`}
            >
              <Icon className="w-4 h-4" />
              {action.name}
            </a>
          );
        })}
      </div>
    </div>
  );
};

// Composant pour afficher le statut de l'utilisateur selon son rôle
export const UserRoleBadge: React.FC<{ role: string; className?: string }> = ({ 
  role, 
  className = '' 
}) => {
  const roleConfig = {
    ROOT: {
      label: 'Super Admin',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Shield
    },
    ADMIN: {
      label: 'Administrateur',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Shield
    },
    PROJECT_MANAGER: {
      label: 'Gestionnaire',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Briefcase
    },
    TEAM_MEMBER: {
      label: 'Membre',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users
    },
    CLIENT: {
      label: 'Client',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Eye
    },
    OBSERVER: {
      label: 'Observateur',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: Eye
    }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.TEAM_MEMBER;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
