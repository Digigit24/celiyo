// Authentication Types for Celiyo Multi-Tenant Architecture

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  enabled_modules: string[];
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  tenant: Tenant;
  roles: Role[];
}

export interface LoginResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: string;
    email: string;
    tenant: string; // This will be the tenant ID
    tenant_name?: string;
    roles: Role[];
  };
}

export interface RefreshTokenPayload {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string; // Optional: new refresh token if rotation enabled
}

export interface TokenVerifyPayload {
  token: string;
}

export interface TokenVerifyResponse {
  valid: boolean;
  decoded: {
    user_id: string;
    tenant_id: string;
    exp: number;
  };
}

export interface LogoutPayload {
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Error response types
export interface AuthErrorResponse {
  error?: string;
  email?: string[];
  password?: string[];
}

// Legacy types for backward compatibility
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface MeResponse {
  success: boolean;
  data: User;
}