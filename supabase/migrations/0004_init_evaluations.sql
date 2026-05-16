-- ¡ATENCIÓN! 
-- Esta tabla NO tiene student_id. 
-- El anonimato es una garantía técnica, no una promesa de interfaz.

CREATE TABLE IF NOT EXISTS evaluations (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id         UUID         NOT NULL REFERENCES professors(id) ON DELETE RESTRICT,
  period_id            UUID         NOT NULL REFERENCES periods(id) ON DELETE RESTRICT,
  score_clarity        SMALLINT     NOT NULL CHECK (score_clarity BETWEEN 1 AND 5),
  score_methodology    SMALLINT     NOT NULL CHECK (score_methodology BETWEEN 1 AND 5),
  score_punctuality    SMALLINT     NOT NULL CHECK (score_punctuality BETWEEN 1 AND 5),
  score_treatment      SMALLINT     NOT NULL CHECK (score_treatment BETWEEN 1 AND 5),
  score_knowledge      SMALLINT     NOT NULL CHECK (score_knowledge BETWEEN 1 AND 5),
  avg_general          NUMERIC(3,2) NOT NULL,
  comment              TEXT,
  comment_is_visible   BOOLEAN      DEFAULT true,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- Índices para búsquedas de promedios por profesor y período
CREATE INDEX IF NOT EXISTS idx_evaluations_professor_period 
  ON evaluations(professor_id, period_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_period 
  ON evaluations(period_id);

-- Tabla de control de duplicados usando hash.
-- Contiene SOLO el hash del token (unidireccional), sin student_id.
CREATE TABLE IF NOT EXISTS evaluation_tokens (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash    VARCHAR(64)  UNIQUE NOT NULL,
  professor_id  UUID         NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  period_id     UUID         NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Índices para búsquedas rápidas de duplicados
CREATE INDEX IF NOT EXISTS idx_evaluation_tokens_hash 
  ON evaluation_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_evaluation_tokens_professor_period 
  ON evaluation_tokens(professor_id, period_id);

-- VIEW: Estadísticas de profesores por período
-- Usada por getPublicRanking y getAdminReport
CREATE OR REPLACE VIEW professor_period_stats AS
SELECT
  p.id AS professor_id,
  p.name AS professor_name,
  p.subject,
  p.department,
  e.period_id,
  COUNT(e.id) AS total_evaluations,
  ROUND(AVG(e.score_clarity)::NUMERIC, 2) AS avg_clarity,
  ROUND(AVG(e.score_methodology)::NUMERIC, 2) AS avg_methodology,
  ROUND(AVG(e.score_punctuality)::NUMERIC, 2) AS avg_punctuality,
  ROUND(AVG(e.score_treatment)::NUMERIC, 2) AS avg_treatment,
  ROUND(AVG(e.score_knowledge)::NUMERIC, 2) AS avg_knowledge,
  ROUND(AVG(e.avg_general)::NUMERIC, 2) AS avg_overall,
  MAX(e.created_at) AS last_evaluation_at
FROM professors p
LEFT JOIN evaluations e ON p.id = e.professor_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.subject, p.department, e.period_id
ORDER BY avg_overall DESC NULLS LAST;

-- INDEX para la auditoría (registra cambios sin revelar student_id)
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at 
  ON evaluations(created_at DESC);
