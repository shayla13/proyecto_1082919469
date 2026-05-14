<<<<<<< HEAD
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
=======
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import type {
  HomeData,
  AppConfig,
  User,
  SessionUser,
  SystemConfig,
  ActivationToken,
  PasswordResetToken,
  Professor,
  CreateProfessorRequest,
  UpdateProfessorRequest,
  Period,
  CreatePeriodRequest,
  UpdatePeriodRequest,
} from './types';
import { HomeDataSchema, AppConfigSchema, SeedSchema } from './validators';
import {
  SeedData,
  readSeedFile,
  writeSeedFile,
} from './seedReader';
import { recordAudit } from './blobAudit';

const DATA_DIR = path.join(process.cwd(), 'data');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const DATABASE_URL = process.env.DATABASE_URL;

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

export function getSystemMode(): 'seed' | 'supabase' {
  return pool ? 'supabase' : 'seed';
}

function getDbPool(): Pool {
  if (!pool) {
    throw new Error('DATABASE_URL no está configurado.');
  }
  return pool;
}

async function query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params: Array<unknown> = []) {
  const db = getDbPool();
  const result = await db.query<T>(text, params);
  return result;
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    const raw = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading data file: ${filePath}`, error);
    throw error;
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing data file: ${filePath}`, error);
    throw error;
  }
}

export async function readHomeData(): Promise<HomeData> {
  const raw = await readJsonFile<unknown>('home.json');
  return HomeDataSchema.parse(raw);
}

>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
export async function readAppConfig(): Promise<AppConfig> {
  const raw = await readJsonFile<unknown>('config.json');
  return AppConfigSchema.parse(raw);
}
<<<<<<< HEAD
=======

export async function getSystemConfig(): Promise<SystemConfig> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    return seed.system_config;
  }

  const result = await query<{ institution_name: string; allowed_domain: string; min_evaluations_to_publish: number }>(
    'SELECT institution_name, allowed_domain, min_evaluations_to_publish FROM system_config LIMIT 1'
  );
  const rowCount = result.rowCount ?? 0;
  if (rowCount === 0) {
    throw new Error('No hay configuración de sistema disponible.');
  }
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const user = seed.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
    return user ?? null;
  }

  const result = await query<User>('SELECT * FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
}

export async function getUserById(userId: number): Promise<User | null> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const user = seed.users.find((entry) => entry.id === userId);
    return user ?? null;
  }

  const result = await query<User>('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
}

function extractEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const systemConfig = await getSystemConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const emailDomain = extractEmailDomain(normalizedEmail);

  if (emailDomain !== systemConfig.allowed_domain.toLowerCase()) {
    throw new Error(`Solo se aceptan correos del dominio ${systemConfig.allowed_domain}.`);
  }

  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Ya existe un usuario con ese correo.');
  }

  const password_hash = await bcrypt.hash(password, 10);

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const nextId = Math.max(0, ...seed.users.map((user) => user.id)) + 1;
    const user: User = {
      id: nextId,
      name,
      email: normalizedEmail,
      password_hash,
      role: 'student',
      is_active: false,
      locked_until: null,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
    };
    seed.users.push(user);
    await writeSeedFile(seed);
    return user;
  }

  const result = await query<User>(
    `INSERT INTO users (name, email, password_hash, role, is_active, locked_until, failed_login_attempts)
     VALUES ($1, $2, $3, 'student', false, NULL, 0)
     RETURNING *`,
    [name, normalizedEmail, password_hash]
  );

  return result.rows[0];
}

export async function createActivationToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const nextId = Math.max(0, ...seed.activation_tokens.map((entry) => entry.id)) + 1;
    seed.activation_tokens.push({
      id: nextId,
      user_id: userId,
      token,
      expires_at: expiresAt,
      used_at: null,
      created_at: now,
    });
    await writeSeedFile(seed);
    return token;
  }

  await query(
    `INSERT INTO activation_tokens (user_id, token, expires_at, used_at)
     VALUES ($1, $2, $3, NULL)`,
    [userId, token, expiresAt]
  );

  return token;
}

export async function activateUser(token: string): Promise<User> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const record = seed.activation_tokens.find((entry) => entry.token === token);
    if (!record) {
      throw new Error('Token de activación inválido.');
    }
    if (record.used_at) {
      throw new Error('El token ya fue utilizado.');
    }
    if (new Date(record.expires_at) <= new Date()) {
      throw new Error('El token de activación ha expirado.');
    }
    const user = seed.users.find((entry) => entry.id === record.user_id);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    user.is_active = true;
    record.used_at = new Date().toISOString();
    await writeSeedFile(seed);
    return user;
  }

  const tokenRow = await query<ActivationToken>(
    'SELECT * FROM activation_tokens WHERE token = $1 LIMIT 1',
    [token]
  );
  if (tokenRow.rowCount === 0) {
    throw new Error('Token de activación inválido.');
  }

  const activation = tokenRow.rows[0];
  if (activation.used_at) {
    throw new Error('El token ya fue utilizado.');
  }
  if (new Date(activation.expires_at) <= new Date()) {
    throw new Error('El token de activación ha expirado.');
  }

  await query('UPDATE users SET is_active = true WHERE id = $1', [activation.user_id]);
  await query('UPDATE activation_tokens SET used_at = NOW() WHERE id = $1', [activation.id]);

  const userResult = await query<User>('SELECT * FROM users WHERE id = $1 LIMIT 1', [activation.user_id]);
  if (userResult.rowCount === 0) {
    throw new Error('Usuario no encontrado.');
  }
  return userResult.rows[0];
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const user = await getUserByEmail(email);
  if (!user || !user.is_active) {
    throw new Error('El usuario no existe o no está activo.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const nextId = Math.max(0, ...seed.password_reset_tokens.map((entry) => entry.id)) + 1;
    seed.password_reset_tokens.push({
      id: nextId,
      user_id: user.id,
      token,
      expires_at: expiresAt,
      used_at: null,
      created_at: now,
    });
    await writeSeedFile(seed);
    return token;
  }

  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at, used_at)
     VALUES ($1, $2, $3, NULL)`,
    [user.id, token, expiresAt]
  );

  return token;
}

export async function resetPassword(token: string, password: string): Promise<void> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const record = seed.password_reset_tokens.find((entry) => entry.token === token);
    if (!record) {
      throw new Error('Token inválido.');
    }
    if (record.used_at) {
      throw new Error('El token ya fue utilizado.');
    }
    if (new Date(record.expires_at) <= new Date()) {
      throw new Error('El link ha expirado.');
    }
    const user = seed.users.find((entry) => entry.id === record.user_id);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    user.password_hash = await bcrypt.hash(password, 10);
    record.used_at = new Date().toISOString();
    await writeSeedFile(seed);
    return;
  }

  const tokenRow = await query<PasswordResetToken>(
    'SELECT * FROM password_reset_tokens WHERE token = $1 LIMIT 1',
    [token]
  );
  if (tokenRow.rowCount === 0) {
    throw new Error('Token inválido.');
  }
  const resetToken = tokenRow.rows[0];
  if (resetToken.used_at) {
    throw new Error('El token ya fue utilizado.');
  }
  if (new Date(resetToken.expires_at) <= new Date()) {
    throw new Error('El link ha expirado.');
  }

  const password_hash = await bcrypt.hash(password, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, resetToken.user_id]);
  await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetToken.id]);
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!passwordMatches) {
    throw new Error('La contraseña actual es incorrecta.');
  }

  const password_hash = await bcrypt.hash(newPassword, 10);

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const record = seed.users.find((entry) => entry.id === userId);
    if (!record) {
      throw new Error('Usuario no encontrado.');
    }
    record.password_hash = password_hash;
    await writeSeedFile(seed);
    return;
  }

  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, userId]);
}

export async function incrementFailedLoginAttempts(userId: number): Promise<void> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const user = seed.users.find((entry) => entry.id === userId);
    if (!user) {
      return;
    }
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    await writeSeedFile(seed);
    return;
  }

  await query(
    `UPDATE users SET failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN NOW() + interval '15 minutes' ELSE locked_until END
     WHERE id = $1`,
    [userId]
  );
}

export async function resetFailedLoginAttempts(userId: number): Promise<void> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const user = seed.users.find((entry) => entry.id === userId);
    if (!user) {
      return;
    }
    user.failed_login_attempts = 0;
    user.locked_until = null;
    await writeSeedFile(seed);
    return;
  }

  await query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1', [userId]);
}

export async function getActiveStudents(): Promise<User[]> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    return seed.users.filter((user) => user.role === 'student' && user.is_active);
  }

  const result = await query<User>('SELECT * FROM users WHERE role = \'student\' AND is_active = true');
  return result.rows;
}

export async function recordAuditEntry(entry: {
  actor: string;
  action: string;
  details: Record<string, unknown>;
}): Promise<void> {
  await recordAudit({
    timestamp: new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
    details: entry.details,
  });
}

// Professor functions
export async function getProfessors(): Promise<Professor[]> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    return seed.professors || [];
  }

  const result = await query<Professor>('SELECT * FROM professors WHERE is_active = true ORDER BY name');
  return result.rows;
}

export async function getProfessorById(id: string): Promise<Professor | null> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const professor = (seed.professors || []).find((entry) => entry.id === id && entry.is_active);
    return professor ?? null;
  }

  const result = await query<Professor>('SELECT * FROM professors WHERE id = $1 AND is_active = true LIMIT 1', [id]);
  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
}

export async function getAllProfessors(): Promise<Professor[]> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    return seed.professors || [];
  }

  const result = await query<Professor>('SELECT * FROM professors ORDER BY name');
  return result.rows;
}

export async function createProfessor(data: CreateProfessorRequest): Promise<Professor> {
  const now = new Date().toISOString();

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const nextId = crypto.randomUUID();
    const professor: Professor = {
      id: nextId,
      name: data.name,
      subject: data.subject,
      department: data.department || null,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    seed.professors = seed.professors || [];
    seed.professors.push(professor);
    await writeSeedFile(seed);
    return professor;
  }

  const result = await query<Professor>(
    `INSERT INTO professors (name, subject, department, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, true, NOW(), NOW())
     RETURNING *`,
    [data.name, data.subject, data.department || null]
  );

  if (result.rowCount === 0) {
    throw new Error('Error al crear profesor.');
  }

  return result.rows[0];
}

export async function updateProfessor(id: string, data: UpdateProfessorRequest): Promise<Professor> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const professor = (seed.professors || []).find((entry) => entry.id === id);
    if (!professor) {
      throw new Error('Profesor no encontrado.');
    }
    if (data.name !== undefined) professor.name = data.name;
    if (data.subject !== undefined) professor.subject = data.subject;
    if (data.department !== undefined) professor.department = data.department;
    professor.updated_at = new Date().toISOString();
    await writeSeedFile(seed);
    return professor;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.subject !== undefined) {
    fields.push(`subject = $${paramIndex++}`);
    values.push(data.subject);
  }
  if (data.department !== undefined) {
    fields.push(`department = $${paramIndex++}`);
    values.push(data.department);
  }

  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar.');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<Professor>(
    `UPDATE professors SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    throw new Error('Profesor no encontrado.');
  }

  return result.rows[0];
}

export async function deactivateProfessor(id: string): Promise<Professor> {
  // RN-08: Verificar si el profesor tiene evaluaciones antes de desactivar
  if (getSystemMode() === 'supabase') {
    const evaluationsCount = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM evaluations WHERE professor_id = $1',
      [id]
    );

    const result = await query<Professor>(
      'UPDATE professors SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Profesor no encontrado.');
    }

    if (evaluationsCount.rows[0].count > 0) {
      throw new Error(
        'El profesor tenía evaluaciones asociadas. Se marcó como inactivo (soft delete) y no se eliminó físicamente.'
      );
    }

    return result.rows[0];
  }

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const professor = (seed.professors || []).find((entry) => entry.id === id);
    if (!professor) {
      throw new Error('Profesor no encontrado.');
    }
    professor.is_active = false;
    professor.updated_at = new Date().toISOString();
    await writeSeedFile(seed);
    return professor;
  }

  throw new Error('Modo de sistema desconocido.');
}

export async function reactivateProfessor(id: string): Promise<Professor> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const professor = (seed.professors || []).find((entry) => entry.id === id);
    if (!professor) {
      throw new Error('Profesor no encontrado.');
    }
    professor.is_active = true;
    professor.updated_at = new Date().toISOString();
    await writeSeedFile(seed);
    return professor;
  }

  const result = await query<Professor>(
    'UPDATE professors SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error('Profesor no encontrado.');
  }

  return result.rows[0];
}

// Period functions
export async function getActivePeriod(): Promise<Period | null> {
  if (getSystemMode() === 'seed') {
    // En modo seed, no hay períodos activos
    return null;
  }

  // Query exacta: usa fechas como fuente de verdad, no status
  const result = await query<Period>(
    `SELECT * FROM periods
     WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
       AND (is_manually_closed IS NULL OR is_manually_closed = false)
     ORDER BY start_date DESC LIMIT 1`
  );

  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
}

export async function getPeriods(): Promise<Period[]> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    return seed.periods || [];
  }

  const result = await query<Period>('SELECT * FROM periods ORDER BY start_date DESC');
  return result.rows;
}

export async function getPeriodById(id: string): Promise<Period | null> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const period = (seed.periods || []).find((entry) => entry.id === id);
    return period ?? null;
  }

  const result = await query<Period>('SELECT * FROM periods WHERE id = $1 LIMIT 1', [id]);
  return (result.rowCount ?? 0) > 0 ? result.rows[0] : null;
}

export async function createPeriod(data: CreatePeriodRequest): Promise<Period> {
  // RN-11: Verificar que no se solape con otro período
  if (getSystemMode() === 'supabase') {
    const overlapCheck = await query<{ count: number }>(
      'SELECT COUNT(*) as count FROM periods WHERE end_date >= $1 AND start_date <= $2',
      [data.start_date, data.end_date]
    );

    if (overlapCheck.rows[0].count > 0) {
      throw new Error('Ya existe un período con fechas solapadas. Verifica las fechas del período anterior.');
    }
  }

  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const nextId = crypto.randomUUID();
    const period: Period = {
      id: nextId,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'activo',
      is_manually_closed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    seed.periods = seed.periods || [];
    seed.periods.push(period);
    await writeSeedFile(seed);
    return period;
  }

  const result = await query<Period>(
    `INSERT INTO periods (name, start_date, end_date, status, is_manually_closed, created_at, updated_at)
     VALUES ($1, $2, $3, 'activo', false, NOW(), NOW())
     RETURNING *`,
    [data.name, data.start_date, data.end_date]
  );

  if (result.rowCount === 0) {
    throw new Error('Error al crear período.');
  }

  return result.rows[0];
}

export async function updatePeriod(id: string, data: UpdatePeriodRequest): Promise<Period> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const period = (seed.periods || []).find((entry) => entry.id === id);
    if (!period) {
      throw new Error('Período no encontrado.');
    }
    if (data.name !== undefined) period.name = data.name;
    if (data.start_date !== undefined) period.start_date = data.start_date;
    if (data.end_date !== undefined) period.end_date = data.end_date;
    if (data.status !== undefined) period.status = data.status;
    if (data.is_manually_closed !== undefined) period.is_manually_closed = data.is_manually_closed;
    period.updated_at = new Date().toISOString();
    await writeSeedFile(seed);
    return period;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.start_date !== undefined) {
    fields.push(`start_date = $${paramIndex++}`);
    values.push(data.start_date);
  }
  if (data.end_date !== undefined) {
    fields.push(`end_date = $${paramIndex++}`);
    values.push(data.end_date);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.is_manually_closed !== undefined) {
    fields.push(`is_manually_closed = $${paramIndex++}`);
    values.push(data.is_manually_closed);
  }

  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar.');
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<Period>(
    `UPDATE periods SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    throw new Error('Período no encontrado.');
  }

  return result.rows[0];
}

export async function closePeriod(id: string): Promise<Period> {
  if (getSystemMode() === 'seed') {
    const seed = await readSeedFile();
    const period = (seed.periods || []).find((entry) => entry.id === id);
    if (!period) {
      throw new Error('Período no encontrado.');
    }
    period.status = 'cerrado';
    period.is_manually_closed = true;
    period.updated_at = new Date().toISOString();
    await writeSeedFile(seed);
    return period;
  }

  const result = await query<Period>(
    'UPDATE periods SET status = \'cerrado\', is_manually_closed = true, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error('Período no encontrado.');
  }

  return result.rows[0];
}
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
