export enum UserRoleName {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  action: string;
  resource: string;
  description?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  roleId: string;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  emailNotifications: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
