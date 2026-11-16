export type UserRole = "visitor" | "user" | "reviewer" | "admin" | "super_admin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
  expiresAt: number;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}
