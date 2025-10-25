// 认证相关类型定义

export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  level: number;
  experience: number;
  streak_days: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
  data?: {
    user: User;
    profile: Profile;
  };
}

// 权限相关类型
export type Permission = 
  | 'create_post'
  | 'create_quest'
  | 'edit_profile'
  | 'delete_content'
  | 'admin';

export interface PermissionCheck {
  permission: Permission;
  granted: boolean;
  reason?: string;
}

// 路由保护类型
export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  permissions?: Permission[];
}

// 认证Hook返回类型
export interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// 权限Hook返回类型
export interface UsePermissionReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  canCreatePost: boolean;
  canCreateQuest: boolean;
  canEditProfile: boolean;
  isAdmin: boolean;
}
