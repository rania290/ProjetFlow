import { 
  Crown, 
  Briefcase, 
  Code, 
  Shield, 
  Eye, 
  UserCheck, 
  UserX
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface RoleAssignment {
  id: string;
  user: User;
  project: Project;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBy?: string;
  notes?: string;
  expiresAt?: string;
}

export interface UserProjectRolesResponse {
  userId: string;
  userFullName: string;
  userEmail: string;
  projects: {
    projectId: string;
    projectName: string;
    role: string;
    isActive: boolean;
    assignedAt: string;
    expiresAt?: string;
  }[];
  totalProjects: number;
}

export interface RoleConfigItem {
  label: string;
  color: string;
  iconColor: string;
  iconBg: string;
  icon: LucideIcon;
  description: string;
  level: number;
}

export type RoleConfigType = Record<string, RoleConfigItem>;

export const ROLE_CONFIG: RoleConfigType = {
  ADMIN: {
    label: 'Admin',
    color: 'bg-purple-50 text-purple-700 border-purple-200/50',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    icon: Crown,
    description: 'Accès complet au projet',
    level: 100
  },
  PROJECT_MANAGER: {
    label: 'Chef de Projet',
    color: 'bg-blue-50 text-blue-700 border-blue-200/50',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    icon: Briefcase,
    description: 'Gestion du projet et équipe',
    level: 80
  },
  DEVELOPER: {
    label: 'Développeur',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    icon: Code,
    description: 'Développement et code',
    level: 60
  },
  DESIGNER: {
    label: 'Designer',
    color: 'bg-pink-50 text-pink-700 border-pink-200/50',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
    icon: Shield,
    description: 'Design et UX/UI',
    level: 60
  },
  TESTER: {
    label: 'Testeur',
    color: 'bg-amber-50 text-amber-700 border-amber-200/50',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    icon: Eye,
    description: 'Tests et QA',
    level: 50
  },
  TEAM_MEMBER: {
    label: 'Membre',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    icon: UserCheck,
    description: 'Participation au projet',
    level: 40
  },
  CLIENT: {
    label: 'Client',
    color: 'bg-orange-50 text-orange-700 border-orange-200/50',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    icon: UserX,
    description: 'Accès consultation uniquement',
    level: 20
  }
};
