-- Migration: 0003_init_periods.sql
-- Description: Create periods table for EvalDoc
-- Created: 2026-05-07

CREATE TABLE IF NOT EXISTS periods (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                VARCHAR(150) NOT NULL,
  start_date          DATE         NOT NULL,
  end_date            DATE         NOT NULL,
  status              VARCHAR(50)  DEFAULT 'activo',
  is_manually_closed  BOOLEAN      DEFAULT false,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT chk_period_dates CHECK (start_date < end_date),
  CONSTRAINT chk_period_status CHECK (status IN ('activo', 'cerrado'))
);

CREATE INDEX IF NOT EXISTS idx_periods_status ON periods(status);
CREATE INDEX IF NOT EXISTS idx_periods_dates ON periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_periods_manually_closed ON periods(is_manually_closed);