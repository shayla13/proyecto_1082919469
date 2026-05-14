-- Migration 0001_init_users.sql
-- Fase 1: usuarios, tokens de activación, tokens de recuperación de contraseña, configuración del sistema

CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'estudiante'
                       CHECK (role IN ('estudiante', 'admin')),
  is_active            BOOLEAN      DEFAULT false,
  login_attempts       INTEGER      DEFAULT 0,
  locked_until         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- Tokens de activación de cuenta por correo
CREATE TABLE IF NOT EXISTS activation_tokens (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(64)  UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(64)  UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Configuración global del sistema (1 sola fila)
CREATE TABLE IF NOT EXISTS system_config (
  id                         SERIAL       PRIMARY KEY,
  institution_name           VARCHAR(150) NOT NULL DEFAULT 'Institución Universitaria',
  allowed_domain             VARCHAR(100) NOT NULL DEFAULT 'evaldoc.edu.co',
  min_evaluations_to_publish INTEGER      NOT NULL DEFAULT 3,
  updated_at                 TIMESTAMPTZ  DEFAULT NOW()
);

-- Tabla de control de migraciones
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_user_id ON activation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
