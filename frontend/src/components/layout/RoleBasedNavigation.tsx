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
  Database,
  HeartHandshake
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
  const { hasPermission, userRole } = usePermissions();
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
      name: 'Reporting & Analytics',
      href: '/analytics',
      icon: BarChart3,
      requiredPermission: 'READ_ANALYTICS',
      requiredRole: ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'RH']
    },
    {
      name: 'Tickets',
      href: '/tickets',
      icon: FileText,
      requiredPermission: 'READ_TICKET'
    },
    {
      name: 'Ressources Humaines',
      href: '/hr',
      icon: HeartHandshake,
      badge: 'Nouveau'
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      requiredPermission: 'VIEW_ADMIN_PANEL',
      requiredRole: ['ADMIN']
    },

    {
      name: 'Paramètres',
      href: '/settings',
      icon: Settings,
      requiredPermission: 'MANAGE_SYSTEM',
      requiredRole: ['ADMIN']
    }
  ];

  // Filtrer les éléments de navigation selon les permissions et rôles
  const filteredNavItems = navigationItems.filter(item => {
    // Si l'élément nécessite un rôle spécifique
    if (item.requiredRole) {
      const roles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
      const hasRequiredRole = userRole && roles.includes(userRole);
      if (!hasRequiredRole) return false;
    }

    // Si l'élément nécessite une permission spécifique
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission);
    }
    
    return true;
  });

  // Debug temporaire
  console.log('Navigation items:', navigationItems);
  console.log('Filtered items:', filteredNavItems);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1">
      {/* Ajout forcé du menu HR - temporaire */}
      <NavLink
        to="/hr"
        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-pink-50 text-pink-700 border border-pink-200"
      >
        <HeartHandshake className="w-5 h-5 text-pink-600" />
        <span className="flex-1">Ressources Humaines</span>
        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
          Nouveau
        </span>
      </NavLink>
      
      {/* Navigation normale */}
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
  const { hasPermission, userRole } = usePermissions();

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
      name: 'Demande de congé',
      icon: HeartHandshake,
      href: '/hr/my-leaves',
      color: 'bg-pink-500 hover:bg-pink-600'
    },

    {
      name: 'Voir les analytics',
      icon: BarChart3,
      href: '/analytics',
      permission: 'READ_ANALYTICS',
      requiredRole: ['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN', 'RH'],
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  const availableActions = quickActions.filter(action => {
    // Si l'action nécessite un rôle spécifique
    if (action.requiredRole) {
      if (!userRole || !action.requiredRole.includes(userRole)) {
        return false;
      }
    }
    return !action.permission || hasPermission(action.permission);
  });

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Actions rapides
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {/* Ajout forcé du bouton HR - temporaire */}
        <a
          href="/hr/my-leaves"
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <HeartHandshake className="w-4 h-4" />
          Demande de congé
        </a>
        
        {availableActions.slice(0, 3).map((action) => {
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
    DEVELOPER: {
      label: 'Développeur',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Users
    },
    DESIGNER: {
      label: 'Designer',
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      icon: Users
    },
    TESTER: {
      label: 'Testeur',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Users
    },
    RH: {
      label: 'RESSOURCES HUMAINES',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
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
    },
    HR_ADMIN: {
      label: 'RH Admin',
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      icon: HeartHandshake
    },
    MANAGER: {
      label: 'Manager',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Briefcase
    },
    EMPLOYEE: {
      label: 'Employé',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users
    }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.DEVELOPER;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
