// lib/dataService.ts
// Punto único de acceso a datos — modo seed o live

import { supabaseAdmin } from './supabase';
import { getSeedAdmin, getSeedSystemConfig, getSeedUserByEmail, readSeed } from './seedReader';
import { recordAudit } from './blobAudit';
import { hashPassword, verifyPassword, generateToken, signJWT } from './auth';
import {
  User,
  SafeUser,
  SystemConfig,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateSystemConfigRequest,
  AuthError,
  ValidationError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  AuditEntry,
} from './types';

let systemMode: 'seed' | 'live' | null = null;

async function detectSystemMode(): Promise<'seed' | 'live'> {
  if (systemMode) {
    return systemMode;
  }

  try {
    const { data, error } = await supabaseAdmin.from('_migrations').select('filename').limit(1);

    if (error || !data) {
      systemMode = 'seed';
    } else {
      systemMode = 'live';
    }
  } catch (error) {
    console.warn('Failed to detect system mode, defaulting to seed:', error);
    systemMode = 'seed';
  }

  return systemMode;
}

export async function getSystemMode(): Promise<'seed' | 'live'> {
  return detectSystemMode();
}

// ============================================================================
// SISTEMA
// ============================================================================

export async function getSystemConfig(): Promise<SystemConfig> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return getSeedSystemConfig();
  }

  const { data, error } = await supabaseAdmin
    .from('system_config')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    throw new NotFoundError('Configuración del sistema no encontrada');
  }

  return data as SystemConfig;
}

export async function updateSystemConfig(request: UpdateSystemConfigRequest): Promise<SystemConfig> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot update system config in seed mode');
  }

  const { data, error } = await supabaseAdmin
    .from('system_config')
    .update({
      ...request,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError('Configuración del sistema no encontrada');
  }

  return data as SystemConfig;
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  const mode = await getSystemMode();
  const normalizedEmail = email.toLowerCase();

  if (mode === 'seed') {
    return getSeedUserByEmail(normalizedEmail);
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('User ID lookup not supported in seed mode');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

export async function createUser(request: CreateUserRequest): Promise<SafeUser> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot create users in seed mode');
  }

  // Validar que el correo pertenece al dominio permitido
  const config = await getSystemConfig();
  const emailDomain = request.email.split('@')[1];

  if (emailDomain !== config.allowed_domain) {
    throw new ValidationError(`Solo se aceptan correos del dominio ${config.allowed_domain}`);
  }

  // Verificar que el usuario no existe
  const existing = await getUserByEmail(request.email);
  if (existing) {
    throw new ConflictError('El correo ya está registrado');
  }

  // Hashear contraseña
  const passwordHash = await hashPassword(request.password);

  // Crear usuario
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: request.name,
      email: request.email.toLowerCase(),
      password_hash: passwordHash,
      role: 'estudiante',
      is_active: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create user');
  }

  const user = data as User;

  // Registrar en auditoría
  await recordAudit({
    id: '',
    timestamp: '',
    action: 'register',
    entity: 'user',
    entity_id: user.id,
    summary: `Nuevo usuario registrado: ${user.email}`,
    metadata: { email: user.email },
  } as AuditEntry);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    login_attempts: user.login_attempts,
    locked_until: user.locked_until,
    created_at: user.created_at,
  } as SafeUser;
}

export async function activateUser(token: string): Promise<SafeUser> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot activate users in seed mode');
  }

  // Buscar el token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('activation_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (tokenError || !tokenData) {
    throw new ValidationError('Token de activación inválido');
  }

  // Verificar que no ha expirado
  if (new Date(tokenData.expires_at) < new Date()) {
    throw new ValidationError('El enlace de activación ha expirado');
  }

  // Verificar que no se ha usado
  if (tokenData.used_at) {
    throw new ValidationError('El enlace de activación ya se utilizó');
  }

  // Activar el usuario
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .update({ is_active: true })
    .eq('id', tokenData.user_id)
    .select()
    .single();

  if (userError || !userData) {
    throw new Error('Failed to activate user');
  }

  // Marcar token como usado
  await supabaseAdmin
    .from('activation_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenData.id);

  const user = userData as User;

  await recordAudit({
    id: '',
    timestamp: '',
    action: 'activate_account',
    entity: 'user',
    entity_id: user.id,
    summary: `Cuenta activada: ${user.email}`,
  } as AuditEntry);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    login_attempts: user.login_attempts,
    locked_until: user.locked_until,
    created_at: user.created_at,
  } as SafeUser;
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot create reset tokens in seed mode');
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  // Generar token
  const resetToken = generateToken(32);

  // Guardar en la BD con expiración de 15 minutos
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const { error } = await supabaseAdmin.from('password_reset_tokens').insert({
    user_id: user.id,
    token: resetToken,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error('Failed to create reset token');
  }

  await recordAudit({
    id: '',
    timestamp: '',
    action: 'request_password_reset',
    entity: 'user',
    entity_id: user.id,
    summary: `Solicitud de recuperación de contraseña: ${user.email}`,
  } as AuditEntry);

  return resetToken;
}

export async function resetPassword(token: string, newPasswordHash: string): Promise<void> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot reset password in seed mode');
  }

  // Buscar el token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (tokenError || !tokenData) {
    throw new ValidationError('Token de recuperación inválido');
  }

  // Verificar que no ha expirado
  if (new Date(tokenData.expires_at) < new Date()) {
    throw new ValidationError('El link ha expirado');
  }

  // Verificar que no se ha usado
  if (tokenData.used_at) {
    throw new ValidationError('El link ya se utilizó');
  }

  // Actualizar contraseña
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', tokenData.user_id);

  if (updateError) {
    throw new Error('Failed to reset password');
  }

  // Marcar token como usado
  await supabaseAdmin
    .from('password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenData.id);

  const user = await getUserById(tokenData.user_id);

  if (user) {
    await recordAudit({
      id: '',
      timestamp: '',
      action: 'reset_password',
      entity: 'user',
      entity_id: user.id,
      summary: `Contraseña restablecida: ${user.email}`,
    } as AuditEntry);
  }
}

export async function updateUser(id: string, request: UpdateUserRequest): Promise<SafeUser> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot update users in seed mode');
  }

  const updates: any = {};

  if (request.name) {
    updates.name = request.name;
  }

  if (request.password) {
    updates.password_hash = await hashPassword(request.password);
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const user = data as User;

  await recordAudit({
    id: '',
    timestamp: '',
    action: 'change_password',
    entity: 'user',
    entity_id: user.id,
    summary: `Cambios en la cuenta: ${user.email}`,
  } as AuditEntry);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    login_attempts: user.login_attempts,
    locked_until: user.locked_until,
    created_at: user.created_at,
  } as SafeUser;
}

export async function incrementLoginAttempts(userId: string): Promise<void> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return;
  }

  const user = await getUserById(userId);

  if (!user) {
    return;
  }

  const newAttempts = user.login_attempts + 1;
  const updates: any = { login_attempts: newAttempts };

  // Si llega a 5 intentos, bloquear por 15 minutos
  if (newAttempts >= 5) {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + 15);
    updates.locked_until = lockedUntil.toISOString();
  }

  await supabaseAdmin.from('users').update(updates).eq('id', userId);
}

export async function resetLoginAttempts(userId: string): Promise<void> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return;
  }

  await supabaseAdmin
    .from('users')
    .update({ login_attempts: 0, locked_until: null })
    .eq('id', userId);
}

// ============================================================================
// AUDITORÍA
// ============================================================================

export { recordAudit };

/**
 * Lee y valida el archivo config.json
 */
export async function readAppConfig(): Promise<AppConfig> {
  const raw = await readJsonFile<unknown>('config.json');
  return AppConfigSchema.parse(raw);
}
