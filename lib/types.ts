// lib/types.ts
// Tipos base del sistema EvalDoc

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'estudiante' | 'admin';
  is_active: boolean;
  login_attempts: number;
  locked_until: string | null;
  created_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface ActivationToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface SystemConfig {
  id: number;
  institution_name: string;
  allowed_domain: string;
  min_evaluations_to_publish: number;
  updated_at: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'estudiante' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  user_role?: 'admin';
  action:
    | 'login'
    | 'logout'
    | 'register'
    | 'activate_account'
    | 'request_password_reset'
    | 'reset_password'
    | 'change_password'
    | 'bootstrap';
  entity: 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

// Request/Response types
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSystemConfigRequest {
  institution_name?: string;
  allowed_domain?: string;
  min_evaluations_to_publish?: number;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(401, message, 'AUTH_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(403, message, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message, 'NOT_FOUND');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(429, message, 'TOO_MANY_REQUESTS');
  }
}
