# EvalDoc — Plan Maestro del Sistema
> Plataforma de Evaluaciones Anónimas de Profesores | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Resend + Vercel
> Estudiante: Shayla Bueno | Doc: 1082919469

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Anonimización técnica por diseño](#13-anonimización-técnica-por-diseño)
14. [Auditoría en Vercel Blob](#14-auditoría-en-vercel-blob)
15. [Arquitectura de rutas](#15-arquitectura-de-rutas)
16. [Requerimientos no funcionales](#16-requerimientos-no-funcionales)
17. [Flujos de usuario y de trabajo](#17-flujos-de-usuario-y-de-trabajo)
18. [Diseño de interfaz](#18-diseño-de-interfaz)
19. [Plan de fases de implementación](#19-plan-de-fases-de-implementación)
20. [Estrategia de seguridad](#20-estrategia-de-seguridad)
21. [Restricciones del sistema](#21-restricciones-del-sistema)
22. [Glosario](#22-glosario)

---

## 1. Definición del sistema

**EvalDoc** es una plataforma web que permite a los estudiantes de una institución educativa calificar a sus docentes de forma completamente anónima al finalizar o durante cada período académico. Los estudiantes asignan puntajes en cinco dimensiones del desempeño docente y pueden dejar comentarios cualitativos optativos. La plataforma genera promedios por dimensión, perfiles de resultado por profesor y un ranking público accesible sin autenticación.

El nombre **EvalDoc** proviene de *Eval* (evaluación) y *Doc* (docente). Es el nombre del software — la institución puede presentarlo bajo su propia marca si lo desea.

La característica técnica más importante del sistema es su **anonimato por diseño**: la arquitectura garantiza que ninguna evaluación enviada pueda vincularse a la identidad del estudiante que la realizó, ni por el administrador, ni por el desarrollador, ni por consultas directas a la base de datos. El anonimato no es una promesa de interfaz — es una garantía técnica implementada en el modelo de datos.

EvalDoc opera completamente desde el navegador con Next.js App Router en Vercel, persiste datos en Supabase Postgres, envía correos con Resend y registra auditoría de operaciones en Vercel Blob.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve EvalDoc |
|---|---|
| Silencio por miedo a represalias de los docentes. | Anonimato técnico por diseño: ningún vínculo estudiante-evaluación puede existir una vez enviada. |
| Mecanismos de retroalimentación tardíos o inexistentes. | Períodos de evaluación configurables, que pueden abrirse en cualquier momento del semestre. |
| Resultados sin transparencia — los estudiantes no saben qué efecto tiene su participación. | Ranking y promedios públicos (sin autenticación) que muestran el impacto real de las evaluaciones. |
| Evaluaciones no representativas de grupos pequeños. | Promedios y ranking solo visibles si el profesor acumula >= 3 evaluaciones (RN-06). |
| Sin control del dominio del registro para garantizar que solo participen estudiantes de la institución. | Validación del dominio institucional configurable por el admin. Solo correos de ese dominio son aceptados (RN-10). |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Estudiante** | Externo | Actor principal. Se registra con correo institucional, verifica su cuenta y emite evaluaciones anónimas. |
| **Administrador** | Interno | Configura la plataforma: períodos, profesores, dominio institucional. Consulta reportes y modera comentarios. |
| **Sistema** | No humano | Calcula promedios, actualiza el ranking, activa y cierra períodos por fechas, envía correos de notificación. |

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Estudiante | Admin |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Registrarse | ✅ | N/A |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **EVALUACIONES** | | |
| Ver listado de profesores del período activo | ✅ | ✅ |
| Enviar evaluación anónima | ✅ | ❌ |
| Ver su progreso (quién evaluó / quién le falta) | ✅ | ❌ |
| Ver promedios públicos del ranking (sin login) | Público | Público |
| **PROFESORES** | | |
| Ver perfiles de profesores (nombre, materia, depto.) | ✅ | ✅ |
| Crear / editar / desactivar perfiles de profesores | ❌ | ✅ |
| **PERÍODOS** | | |
| Ver el período académico activo | ✅ | ✅ |
| Crear / editar / cerrar períodos | ❌ | ✅ |
| **REPORTES** | | |
| Ver reportes detallados de evaluaciones | ❌ | ✅ |
| Ver comentarios (para moderación) | ❌ | ✅ |
| Eliminar comentarios inapropiados | ❌ | ✅ |
| **CONFIGURACIÓN** | | |
| Configurar dominio institucional permitido | ❌ | ✅ |
| **AUDITORÍA** | | |
| Ver bitácora de operaciones | ❌ | ✅ |

### Restricción fundamental del administrador

El administrador **nunca puede** vincular una evaluación a un estudiante específico. Esto es una garantía técnica, no solo una restricción de interfaz:
- La tabla `evaluations` no tiene columna `student_id`.
- La tabla `evaluation_tokens` guarda solo hashes unidireccionales — ninguna consulta SQL puede recuperar el `student_id` original desde ellos.
- Los endpoints de reportes del admin devuelven evaluaciones sin ningún dato de identidad del estudiante.

---

## 5. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Registrarse | Estudiante | Crea cuenta con nombre, correo institucional y contraseña. El sistema valida el dominio (RN-10), envía correo de verificación con Resend. La cuenta queda en estado `pendiente_verificacion` hasta que el estudiante haga clic en el enlace. |
| CU-A2 | Verificar correo | Estudiante | El estudiante hace clic en el enlace de activación. El sistema activa la cuenta y redirige al login. |
| CU-A3 | Iniciar sesión | Todos | Ingresa correo y contraseña. Tras 5 intentos fallidos, bloqueo de 15 minutos. |
| CU-A4 | Recuperar contraseña | Estudiante | Solicita link de restablecimiento enviado a su correo institucional. El link expira en 15 minutos. |
| CU-A5 | Cambiar contraseña | Todos | Actualiza contraseña autenticado, verificando la actual. |

### Módulo de Evaluación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Ver listado de profesores | Estudiante | Lista de todos los profesores activos del período con indicador de evaluado/pendiente basado en el hash del estudiante. |
| CU-02 | Enviar evaluación | Estudiante | Califica a un profesor en 5 dimensiones (1–5), deja comentario opcional. El sistema anonimiza, registra el hash de control y guarda la evaluación sin vínculo de identidad. |
| CU-03 | Ver progreso propio | Estudiante | Cuántos profesores evaluó y cuántos le faltan en el período activo. |

### Módulo de Resultados Públicos

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-04 | Ver ranking público | Cualquier visitante | Lista de profesores ordenados por promedio general descendente. Solo aparecen los que tienen >= 3 evaluaciones en el período (RN-06). Accesible sin autenticación. |
| CU-05 | Ver perfil de resultados de un profesor | Cualquier visitante | Promedios por dimensión y promedio general. Solo si tiene >= 3 evaluaciones. Sin comentarios individuales visibles al público. |

### Módulo de Administración

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Gestionar profesores | Admin | Crear, editar y desactivar perfiles de profesores (nombre, materia, departamento). RN-08: desactivar si tiene evaluaciones, nunca eliminar físicamente. |
| CU-07 | Gestionar períodos | Admin | Crear, editar y cerrar períodos con nombre, fecha de inicio y cierre. El sistema activa/cierra automáticamente por fechas en cada request. |
| CU-08 | Consultar reportes | Admin | Ver evaluaciones detalladas filtradas por profesor, materia o período. Los reportes incluyen los promedios por dimensión y los comentarios, pero nunca la identidad del evaluador. |
| CU-09 | Moderar comentarios | Admin | Ver lista de comentarios y eliminar los que violen normas de convivencia. |
| CU-10 | Configurar sistema | Admin | Cambiar el dominio institucional permitido y el nombre de la institución. |
| CU-11 | Notificar apertura de período | Sistema / Admin | Al activar un período, el sistema puede enviar un correo masivo a todos los estudiantes registrados y activos. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema debe permitir registro solo con correos del dominio institucional configurado (RN-10). |
| RF-02 | El registro debe requerir verificación de correo antes de activar la cuenta (Resend). |
| RF-03 | El sistema debe implementar recuperación de contraseña por link con vigencia de 15 minutos. |
| RF-04 | El estudiante debe poder ver el listado de profesores del período activo con indicador evaluado/pendiente. |
| RF-05 | El estudiante debe poder enviar evaluaciones con calificaciones 1–5 en 5 dimensiones y comentario opcional. |
| RF-06 | El sistema debe impedir evaluaciones duplicadas del mismo estudiante al mismo profesor en el mismo período (RN-02). |
| RF-07 | El sistema debe garantizar que ninguna evaluación sea vinculable a un estudiante (RN-05 — anonimato técnico). |
| RF-08 | El sistema debe mostrar promedios por dimensión y ranking público solo para profesores con >= 3 evaluaciones (RN-06). |
| RF-09 | Las evaluaciones solo deben aceptarse mientras el período esté activo (RN-03). |
| RF-10 | El admin debe poder crear, editar y cerrar períodos académicos. |
| RF-11 | El admin debe poder gestionar perfiles de profesores (crear, editar, desactivar). |
| RF-12 | El admin debe poder consultar reportes de evaluaciones sin acceder a la identidad de los evaluadores. |
| RF-13 | El admin debe poder moderar y eliminar comentarios inapropiados. |
| RF-14 | El sistema debe enviar correo cuando se abre un período de evaluación a todos los estudiantes activos. |
| RF-15 | El sistema debe mostrar al estudiante su progreso de evaluaciones en el período activo. |
| RF-A1 | Toda operación de administración debe quedar registrada en auditoría (Vercel Blob). |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | Un estudiante no puede enviar evaluaciones sin sesión activa. | `withAuth` en el endpoint de evaluación. |
| RN-02 | Cada estudiante puede evaluar a cada profesor exactamente una vez por período. | Calcular `token = SHA256(student_id + professor_id + period_id)`. Buscar en `evaluation_tokens`. Si existe: retornar 409. Si no: insertar el token y la evaluación en una operación. |
| RN-03 | Las evaluaciones solo pueden realizarse mientras el período esté activo. | Verificar en el servidor: `SELECT * FROM periods WHERE status='activo' AND start_date <= NOW() AND end_date >= NOW()`. Si no hay período activo: retornar 403. |
| RN-04 | Las calificaciones en todas las dimensiones son obligatorias (1–5). El comentario es opcional. | Validación Zod: todos los scores requeridos, `z.number().int().min(1).max(5)`. |
| RN-05 | El anonimato es absoluto e irreversible. La evaluación no conserva la identidad del estudiante. | La tabla `evaluations` NO tiene `student_id`. Solo `{ professor_id, period_id, scores, comment }`. La tabla `evaluation_tokens` solo guarda `{ token_hash, professor_id, period_id }` — el hash es SHA256 unidireccional, imposible de revertir. |
| RN-06 | Los promedios y el ranking de un profesor solo se publican si tiene >= 3 evaluaciones en el período. | Query: `WHERE count >= 3`. Si tiene menos, el perfil del profesor en el ranking muestra "Aún no hay suficientes evaluaciones". |
| RN-07 | Solo el admin puede gestionar períodos, profesores, reportes y configuración. | `withRole(['admin'])` en todas las rutas de administración. |
| RN-08 | Un profesor con evaluaciones no puede eliminarse físicamente. Solo desactivar. | Verificar `COUNT(*) FROM evaluations WHERE professor_id = ?` antes de eliminar. Si > 0: retornar 409 y usar `is_active = false` en su lugar. |
| RN-09 | Las calificaciones deben estar entre 1 y 5. | Validación Zod en servidor. CHECK en Postgres. Doble defensa. |
| RN-10 | El registro solo acepta correos del dominio institucional configurado en `system_config`. | Al registrarse: extraer el dominio del correo y comparar con `system_config.allowed_domain`. Si no coincide: retornar 400. |
| RN-11 | No puede haber dos períodos activos simultáneamente. | Al crear un período, verificar que no haya otro con fechas solapadas y status != 'cerrado'. Si hay solapamiento: retornar 409. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Hash de anonimización | `crypto` (nativo Node) | — | SHA256 para tokens de control de duplicados |
| Base de datos | Supabase Postgres | — | Datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Correo | Resend | — | Verificación de cuenta, recuperación de contraseña, notificación de período |
| Auditoría | `@vercel/blob` | — | Logs de operaciones del admin |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=          # ej: noreply@evaldoc.edu.co
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, profesores, períodos, evaluaciones (sin `student_id`), tokens de control de duplicados (solo hash), comentarios, configuración del sistema. | Todo el dominio requiere SQL: promedios por dimensión, ranking, verificación de período activo, control de duplicados por hash. |
| **Vercel Blob** | Auditoría de operaciones del admin (`audit/<YYYYMM>.json`). | Logs append-only sin necesidad de SQL. |
| **`data/` en el repo** | Seed inicial: admin + configuración del sistema por defecto (dominio, nombre de institución). | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **La tabla `evaluations` NUNCA tendrá `student_id`.** Si alguna versión futura del código intenta agregar ese campo, es una vulnerabilidad de privacidad. Prohibición explícita documentada.
3. **La tabla `evaluation_tokens` solo guarda hashes.** El hash `SHA256(student_id + professor_id + period_id)` es el único vínculo que existe — y es unidireccional.
4. **CERO caché** en datos transaccionales. El ranking y los promedios cambian con cada evaluación.
5. **CERO CDN cache** en `/api/:path*`. Headers `no-store`.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
7. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "EvalDoc" }
  seed.json       ← {
                      "users": [{
                        email: "admin@evaldoc.edu.co",
                        password_hash: "<bcrypt admin123>",
                        name: "Administrador",
                        role: "admin"
                      }],
                      "system_config": {
                        "institution_name": "Institución Universitaria",
                        "allowed_domain": "evaldoc.edu.co",
                        "min_evaluations_to_publish": 3
                      }
                    }
  README.md
```

> El administrador debe cambiar `allowed_domain` en la configuración del sistema al primer uso para que coincida con el dominio real de la institución (ej: `corhuila.edu.co`).

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql          ← Fase 1: users + system_config + activation_tokens
                                           + password_reset_tokens + _migrations
  0002_init_professors.sql     ← Fase 3: professors
  0003_init_periods.sql        ← Fase 4: periods
  0004_init_evaluations.sql    ← Fase 5: evaluations + evaluation_tokens
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts         ← ÚNICO punto de acceso
  supabase.ts            ← Solo lo importa dataService
  blobAudit.ts           ← Solo lo importa dataService
  pgMigrate.ts           ← Solo lo importa /api/system/bootstrap
  seedReader.ts          ← Solo lo importa dataService en modo seed
  anonymizationService.ts ← computeEvaluationToken, verifyNotDuplicate
  evaluationService.ts   ← calculateAverages, buildRanking
  emailService.ts        ← sendVerificationEmail, sendPasswordReset,
                            sendPeriodOpenNotification
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>
export async function getSystemConfig(): Promise<SystemConfig>
export async function updateSystemConfig(data: UpdateSystemConfigRequest): Promise<SystemConfig>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function activateUser(token: string): Promise<User>
export async function createPasswordResetToken(email: string): Promise<string>
export async function resetPassword(token: string, newPasswordHash: string): Promise<void>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(filters?: UserFilters): Promise<SafeUser[]>
export async function incrementLoginAttempts(userId: string): Promise<void>
export async function resetLoginAttempts(userId: string): Promise<void>

// Profesores
export async function getProfessors(filters?: ProfessorFilters): Promise<Professor[]>
export async function getProfessorById(id: string): Promise<Professor | null>
export async function createProfessor(userId: string, data: CreateProfessorRequest): Promise<Professor>
export async function updateProfessor(id: string, userId: string, data: UpdateProfessorRequest): Promise<Professor>
export async function deactivateProfessor(id: string, userId: string): Promise<Professor>

// Períodos
export async function getActivePeriod(): Promise<Period | null>
export async function getPeriods(): Promise<Period[]>
export async function createPeriod(userId: string, data: CreatePeriodRequest): Promise<Period>
export async function updatePeriod(id: string, userId: string, data: UpdatePeriodRequest): Promise<Period>
export async function closePeriod(id: string, userId: string): Promise<Period>

// Evaluaciones (sin student_id en ningún retorno)
export async function submitEvaluation(studentId: string, data: SubmitEvaluationRequest): Promise<void>
export async function getStudentProgress(studentId: string, periodId: string): Promise<StudentProgress>
export async function hasStudentEvaluated(studentId: string, professorId: string, periodId: string): Promise<boolean>

// Resultados públicos (sin autenticación requerida)
export async function getPublicRanking(periodId: string): Promise<PublicRankingItem[]>
export async function getPublicProfessorProfile(professorId: string, periodId: string): Promise<PublicProfessorProfile | null>

// Reportes del admin (sin identidad de estudiante)
export async function getAdminReport(filters: ReportFilters): Promise<AdminReportData>
export async function getComments(periodId: string, professorId?: string): Promise<CommentItem[]>
export async function deleteComment(commentId: string, adminId: string): Promise<void>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica en servicios de dominio

**`lib/anonymizationService.ts`**

```typescript
import { createHash } from 'crypto';

// Genera el token de control de duplicados.
// El resultado es un hash SHA256 en hexadecimal.
// Es UNIDIRECCIONAL: dado el hash, es computacionalmente
// imposible recuperar student_id, professor_id ni period_id.
export function computeEvaluationToken(
  studentId: string,
  professorId: string,
  periodId: string
): string {
  return createHash('sha256')
    .update(`${studentId}:${professorId}:${periodId}`)
    .digest('hex');
}

// Verifica si el estudiante ya evaluó a ese profesor en ese período.
// No hace ninguna consulta sobre el student_id directamente —
// solo busca si el hash existe en evaluation_tokens.
export async function verifyNotDuplicate(
  studentId: string,
  professorId: string,
  periodId: string
): Promise<boolean> {
  const token = computeEvaluationToken(studentId, professorId, periodId);
  // SELECT COUNT(*) FROM evaluation_tokens WHERE token_hash = ?
  // Retorna true si NO existe (puede evaluar), false si ya existe (duplicado)
}
```

**`lib/evaluationService.ts`**

```typescript
// Calcula los promedios por dimensión de un profesor en un período.
// Solo ejecuta si el profesor tiene >= min_evaluations_to_publish evaluaciones.
export async function calculateAverages(professorId: string, periodId: string): Promise<ProfessorAverages | null>

// Construye el ranking público: lista de profesores ordenados por
// avg_general DESC, filtrado a los que tienen >= min_evaluations_to_publish.
export async function buildRanking(periodId: string): Promise<PublicRankingItem[]>
```

**`lib/emailService.ts`**

```typescript
import { Resend } from 'resend';

// Envía el correo de verificación de cuenta con el link de activación.
export async function sendVerificationEmail(to: string, activationToken: string, institutionName: string): Promise<void>

// Envía el link de recuperación de contraseña (vigencia 15 min).
export async function sendPasswordResetEmail(to: string, resetToken: string, institutionName: string): Promise<void>

// Envía notificación masiva de apertura de período a todos los estudiantes activos.
// Hace un loop de envíos individuales (Resend no tiene envío masivo en plan gratuito).
export async function sendPeriodOpenNotification(period: Period, students: string[], institutionName: string): Promise<{ sent: number; failed: number }>
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users ──< evaluation_tokens (token_hash only — sin student_id en evaluations)
users ──< activation_tokens (para verificación de correo)
users ──< password_reset_tokens

professors ──< evaluations (professor_id)
             ──< evaluation_tokens (professor_id)

periods ──< evaluations (period_id)
          ──< evaluation_tokens (period_id)

system_config (1 sola fila)
```

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'estudiante'
                       CHECK (role IN ('estudiante', 'admin')),
  is_active            BOOLEAN      DEFAULT false,   -- false hasta verificar correo
  login_attempts       INTEGER      DEFAULT 0,
  locked_until         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- Tokens de activación de cuenta por correo
CREATE TABLE IF NOT EXISTS activation_tokens (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(64)  UNIQUE NOT NULL,  -- token aleatorio (32 bytes hex)
  expires_at TIMESTAMPTZ  NOT NULL,          -- NOW() + 24h
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(64)  UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,          -- NOW() + 15 min
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

> **Nota:** Los admins se crean directamente en el seed o en el panel de admin — no se registran por el flujo público. El seed carga un admin con `is_active = true` directamente.

### Migration `0002_init_professors.sql`

```sql
CREATE TABLE IF NOT EXISTS professors (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  subject     VARCHAR(150) NOT NULL,       -- materia principal
  department  VARCHAR(150),
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professors_active ON professors(is_active);
```

### Migration `0003_init_periods.sql`

```sql
CREATE TABLE IF NOT EXISTS periods (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,       -- ej: "Semestre 2026-1"
  start_date  DATE         NOT NULL,
  end_date    DATE         NOT NULL,
  status      VARCHAR(15)  NOT NULL DEFAULT 'programado'
              CHECK (status IN ('programado', 'activo', 'cerrado')),
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW(),
  CHECK (start_date < end_date)
);

CREATE INDEX IF NOT EXISTS idx_periods_status ON periods(status);
CREATE INDEX IF NOT EXISTS idx_periods_dates  ON periods(start_date, end_date);
```

> **Activación automática por fechas**: el sistema no usa cron para activar/cerrar períodos. En cada request que verifica si hay período activo, la query compara con `NOW()`: `WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE`. El campo `status` se actualiza manualmente por el admin o cuando el sistema detecta el estado real por fechas. La fuente de verdad son las fechas, no el campo `status`.

### Migration `0004_init_evaluations.sql`

```sql
-- ¡ATENCIÓN! Esta tabla NO tiene student_id. El anonimato es por diseño del esquema.
CREATE TABLE IF NOT EXISTS evaluations (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id         UUID         NOT NULL REFERENCES professors(id),
  period_id            UUID         NOT NULL REFERENCES periods(id),
  -- Cinco dimensiones de evaluación
  score_clarity        SMALLINT     NOT NULL CHECK (score_clarity BETWEEN 1 AND 5),
  score_methodology    SMALLINT     NOT NULL CHECK (score_methodology BETWEEN 1 AND 5),
  score_punctuality    SMALLINT     NOT NULL CHECK (score_punctuality BETWEEN 1 AND 5),
  score_treatment      SMALLINT     NOT NULL CHECK (score_treatment BETWEEN 1 AND 5),
  score_knowledge      SMALLINT     NOT NULL CHECK (score_knowledge BETWEEN 1 AND 5),
  -- Promedio general calculado al insertar
  avg_general          DECIMAL(3,2) NOT NULL,
  -- Comentario opcional — visible solo para el admin en reportes
  comment              TEXT,
  comment_is_visible   BOOLEAN      DEFAULT true,  -- false si fue moderado
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- Control de duplicados con hash unidireccional (RN-02 + RN-05)
-- Esta tabla NO guarda student_id. Solo el hash.
CREATE TABLE IF NOT EXISTS evaluation_tokens (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash   VARCHAR(64)  UNIQUE NOT NULL,  -- SHA256 hex de (student_id:professor_id:period_id)
  professor_id UUID         NOT NULL REFERENCES professors(id),
  period_id    UUID         NOT NULL REFERENCES periods(id),
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_professor_period
  ON evaluations(professor_id, period_id);
CREATE INDEX IF NOT EXISTS idx_eval_tokens_hash
  ON evaluation_tokens(token_hash);

-- Vista pre-calculada de promedios por profesor por período.
-- Se usa en el ranking público.
CREATE VIEW professor_period_stats AS
SELECT
  professor_id,
  period_id,
  COUNT(*)                          AS total_evaluations,
  ROUND(AVG(score_clarity), 2)      AS avg_clarity,
  ROUND(AVG(score_methodology), 2)  AS avg_methodology,
  ROUND(AVG(score_punctuality), 2)  AS avg_punctuality,
  ROUND(AVG(score_treatment), 2)    AS avg_treatment,
  ROUND(AVG(score_knowledge), 2)    AS avg_knowledge,
  ROUND(AVG(avg_general), 2)        AS avg_overall
FROM evaluations
GROUP BY professor_id, period_id;
```

---

## 13. Anonimización técnica por diseño

Esta sección documenta la garantía técnica del anonimato (RN-05) — el aspecto más crítico de EvalDoc.

### 13.1 El problema que resuelve

Un sistema ingenuo podría guardar la evaluación con `student_id` y simplemente no mostrarlo en la interfaz. Pero cualquier administrador de base de datos podría hacer `SELECT student_id FROM evaluations WHERE professor_id = ?` y obtener quién evaluó a quién. Eso no es anonimato — es solo privacidad de interfaz.

EvalDoc garantiza el anonimato a nivel del esquema de base de datos.

### 13.2 Cómo funciona

**Al enviar una evaluación**, el servidor ejecuta dos operaciones:

```
1. INSERT INTO evaluations
   (professor_id, period_id, scores..., avg_general, comment)
   VALUES (...) — SIN student_id

2. INSERT INTO evaluation_tokens
   (token_hash, professor_id, period_id)
   WHERE token_hash = SHA256("student_uuid:professor_uuid:period_uuid")
```

**Al verificar si el estudiante ya evaluó a un profesor:**

```
token = SHA256("student_uuid:professor_uuid:period_uuid")
SELECT COUNT(*) FROM evaluation_tokens WHERE token_hash = token
→ Si COUNT > 0: el estudiante ya evaluó (RN-02)
→ Si COUNT = 0: puede evaluar
```

**Al mostrar el progreso del estudiante** (RF-15):

```
Para cada profesor del período activo:
  token = SHA256("student_uuid:professor_uuid:period_uuid")
  ¿Existe ese hash en evaluation_tokens? → "Evaluado ✅" / "Pendiente ⏳"
```

### 13.3 Por qué el hash es unidireccional

SHA256 es una función hash criptográfica. Sus propiedades:
- **Determinística**: el mismo input siempre produce el mismo output.
- **Unidireccional**: dado el hash `abc123...`, es computacionalmente imposible (con la tecnología actual) recuperar los inputs originales.
- **Resistente a colisiones**: es prácticamente imposible que dos inputs distintos produzcan el mismo hash.

Esto significa que, incluso con acceso total a la base de datos, nadie puede saber quién evaluó a quién — solo que *alguien* ya lo hizo.

### 13.4 Qué pueden ver los actores

| Actor | Puede ver |
|---|---|
| **Estudiante autenticado** | Si ya evaluó a cada profesor (su propio progreso). |
| **Administrador** | Promedios por dimensión. Comentarios anónimos. Conteo de evaluaciones. Sin identidad del evaluador. |
| **Visitante sin login** | Ranking público y promedios (solo si >= 3 evaluaciones). |
| **DBA con acceso a Supabase** | Filas en `evaluations` sin `student_id`. Hashes en `evaluation_tokens` sin `student_id`. Es imposible vincularlos. |

### 13.5 Operación `submitEvaluation` en el `dataService`

```typescript
export async function submitEvaluation(
  studentId: string,
  data: SubmitEvaluationRequest
): Promise<void> {
  const { professorId, periodId, scores, comment } = data;

  // 1. Verificar período activo (RN-03)
  const period = await getActivePeriod();
  if (!period || period.id !== periodId) throw new ForbiddenError('Período no activo');

  // 2. Verificar duplicado con hash (RN-02)
  const token = computeEvaluationToken(studentId, professorId, periodId);
  const isDuplicate = !(await verifyNotDuplicate(studentId, professorId, periodId));
  if (isDuplicate) throw new ConflictError('Ya evaluaste a este profesor en este período');

  // 3. Calcular promedio general
  const avgGeneral = (scores.clarity + scores.methodology +
    scores.punctuality + scores.treatment + scores.knowledge) / 5;

  // 4. Insertar evaluación SIN student_id
  await supabase.from('evaluations').insert({
    professor_id: professorId,
    period_id: periodId,
    score_clarity: scores.clarity,
    score_methodology: scores.methodology,
    score_punctuality: scores.punctuality,
    score_treatment: scores.treatment,
    score_knowledge: scores.knowledge,
    avg_general: avgGeneral,
    comment: comment ?? null,
  });

  // 5. Insertar token de control (solo hash, sin student_id)
  await supabase.from('evaluation_tokens').insert({
    token_hash: token,
    professor_id: professorId,
    period_id: periodId,
  });

  // 6. Auditoría (solo registra que el estudiante evaluó — sin detalle de qué calificó)
  await recordAudit({
    action: 'submit_evaluation',
    entity: 'evaluation',
    summary: `Evaluación anónima enviada para período ${periodId}`,
    // user_id se incluye en la auditoría solo para operaciones de admin
    // Para evaluaciones de estudiantes, el user_id NO se registra en auditoría
  });
}
```

---

## 14. Auditoría en Vercel Blob

### 14.1 Qué se registra (y qué NO)

**Se registra:**
- Operaciones del admin: crear/editar período, crear/editar/desactivar profesor, eliminar comentario, cambiar configuración, crear usuario.
- Login/logout del admin.
- Bootstrap del sistema.

**NO se registra con identidad del estudiante:**
- Las evaluaciones enviadas. Solo se registra un evento genérico sin `user_id` del estudiante para preservar el anonimato incluso en la auditoría.
- El progreso de evaluaciones de cada estudiante.

### 14.2 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id?: string;         // Solo para operaciones de admin. Omitido para evaluaciones.
  user_email?: string;
  user_role?: 'admin';
  action:
    | 'login' | 'logout'
    | 'create_professor' | 'update_professor' | 'deactivate_professor'
    | 'create_period' | 'update_period' | 'close_period'
    | 'delete_comment' | 'update_system_config'
    | 'create_admin_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'professor' | 'period' | 'comment' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
```

---

## 15. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                       ← Landing pública con ranking (si hay período activo)
  login/page.tsx
  register/page.tsx
  verify/page.tsx                ← Activación de cuenta por token
  forgot-password/page.tsx
  reset-password/page.tsx        ← Formulario de nueva contraseña
  dashboard/page.tsx             ← Panel del estudiante: lista de profesores + progreso
  evaluate/
    [professorId]/page.tsx       ← Formulario de evaluación
  ranking/page.tsx               ← Ranking público (sin login)
  professors/
    [id]/page.tsx                ← Perfil público del profesor con promedios
  profile/page.tsx               ← Cambiar contraseña
  admin/
    db-setup/page.tsx
    periods/page.tsx             ← Gestión de períodos
    periods/new/page.tsx
    periods/[id]/edit/page.tsx
    professors/page.tsx          ← Catálogo de profesores
    professors/new/page.tsx
    professors/[id]/edit/page.tsx
    reports/page.tsx             ← Reportes detallados
    comments/page.tsx            ← Moderación de comentarios
    config/page.tsx              ← Dominio institucional y nombre
    users/page.tsx               ← Gestión de estudiantes registrados
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/
      login/route.ts             ← POST (con bloqueo por intentos)
      logout/route.ts
      register/route.ts          ← POST (valida dominio, envía verificación)
      verify/route.ts            ← POST (activa cuenta por token)
      me/route.ts
      change-password/route.ts
      forgot-password/route.ts   ← POST (envía reset token)
      reset-password/route.ts    ← POST (aplica nueva contraseña)
    evaluate/route.ts            ← POST (anonimización + control de duplicados)
    professors/
      route.ts                   ← GET lista (público)
      [id]/route.ts              ← GET perfil con promedios (público si ≥3 eval)
      [id]/progress/route.ts     ← GET si el estudiante ya evaluó este profesor
    ranking/route.ts             ← GET ranking público
    periods/active/route.ts      ← GET período activo (público)
    admin/
      professors/route.ts | [id]/route.ts
      periods/route.ts | [id]/route.ts
      periods/[id]/notify/route.ts  ← POST enviar correo masivo
      reports/route.ts
      comments/route.ts | [id]/route.ts
      config/route.ts
      users/route.ts | [id]/route.ts
    audit/route.ts
    dashboard/route.ts

components/
  ui/
  layout/                        ← AppLayout, SeedModeBanner
  evaluation/                    ← EvaluationForm, DimensionRating, ProgressTracker
  ranking/                       ← RankingTable, ProfessorCard, AverageBar
  admin/                         ← PeriodForm, ProfessorForm, CommentModerator,
                                    ReportFilters, DiagnosticPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  anonymizationService.ts | evaluationService.ts | emailService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 16. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El ranking público debe cargar en menos de 2 segundos sin necesidad de autenticación. |
| RNF-02 | El envío de una evaluación debe completarse en menos de 1 segundo desde la confirmación del estudiante. |
| RNF-03 | El anonimato debe ser verificable técnicamente — un DBA con acceso a Supabase no debe poder vincular evaluaciones con estudiantes. |
| RNF-04 | La interfaz debe ser completamente funcional en celulares (muchos estudiantes evalúan desde el teléfono). |
| RNF-05 | Las contraseñas deben hashearse con bcrypt antes de guardarse. |
| RNF-06 | Las sesiones deben gestionarse con JWT en cookie HttpOnly. |
| RNF-07 | El registro solo acepta correos del dominio configurado (validación en servidor). |
| RNF-08 | Los tokens de verificación y de recuperación de contraseña deben expirar en los tiempos definidos (24h y 15 min respectivamente). |

---

## 17. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

Igual que todos los proyectos del curso: login con admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live activo. Después del bootstrap, el admin debe ir a `/admin/config` para configurar el dominio institucional real.

### Flujo de evaluación anónima (estudiante)

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Login | El estudiante inicia sesión con su correo institucional verificado. |
| 2 | Dashboard | Ve la lista de profesores del período activo. Cada uno tiene un badge "✅ Evaluado" o "⏳ Pendiente". |
| 3 | Dashboard | Selecciona un profesor pendiente y hace clic en "Evaluar". |
| 4 | Formulario | Asigna una calificación (1–5) a cada dimensión y opcionalmente deja un comentario. |
| 5 | Confirmación | Hace clic en "Enviar evaluación". El sistema muestra un modal de confirmación. |
| 6 | Sistema | Computa el hash `SHA256(student_id:professor_id:period_id)`, verifica que no existe, inserta la evaluación SIN student_id y el token en tablas separadas. |
| 7 | Resultado | El estudiante ve: "✔ Evaluación enviada de forma anónima." El profesor pasa a "✅ Evaluado" en la lista. |
| 8 | Ranking | Cuando el profesor acumula >= 3 evaluaciones, sus promedios aparecen en el ranking público. |

---

## 18. Diseño de interfaz

### Identidad visual del Login

EvalDoc es una plataforma institucional de evaluación. El diseño transmite seriedad, confianza y transparencia académica.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado. |
| **Fondo** | Blanco puro (`#FFFFFF`) con un sutil degradado suave de azul institucional claro en la parte superior. |
| **Tarjeta del formulario** | Fondo blanco, `border-radius: 12px`, sombra muy suave, borde superior de 4px en azul institucional (`#2563EB`), max-w-sm. |
| **Logo** | SVG inline de un documento con estrella de calificación superpuesta en azul institucional, 48×48px. |
| **Nombre** | "EvalDoc" en Inter SemiBold 28px, azul oscuro (`#1E3A5F`). |
| **Tagline** | "Tu opinión mejora la educación." Inter Regular 13px, gris medio (`#6B7280`). |
| **Campos** | Borde gris (`#D1D5DB`), focus en azul (`#2563EB`). |
| **Botón principal** | "Ingresar" — azul `#2563EB`, texto blanco, hover `#1D4ED8`. |
| **Link de registro** | "¿Primera vez? Regístrate con tu correo institucional." |
| **Animación** | Framer Motion: `opacity: 0→1`, `y: 10→0`, duración 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (azul institucional) | `#2563EB` |
| Primario oscuro | `#1D4ED8` |
| Primario claro | `#DBEAFE` |
| Fondo principal | `#F9FAFB` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#1E3A5F` |
| Texto secundario | `#6B7280` |
| Evaluado / éxito | `#16A34A` (verde) |
| Pendiente | `#D97706` (ámbar) |
| Error / rechazado | `#DC2626` |
| Calificación 1–2 | `#EF4444` (bajo) |
| Calificación 3 | `#F59E0B` (medio) |
| Calificación 4–5 | `#16A34A` (alto) |
| Bordes | `#E5E7EB` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Componentes clave

| Componente | Descripción |
|---|---|
| `DimensionRating` | 5 botones de calificación por dimensión (1–5). El número seleccionado cambia a fondo azul. Si no se seleccionó, el borde es rojo al intentar enviar (RN-04). |
| `ProgressTracker` | Tarjeta en el dashboard: "Has evaluado X de Y profesores." Barra de progreso azul. |
| `ProfessorCard` | Card en el listado: nombre, materia, departamento, badge "Evaluado ✅" o "Pendiente ⏳". |
| `RankingTable` | Tabla con posición, nombre del profesor, departamento, promedio general y barra visual de los 5 promedios por dimensión. Solo muestra profesores con >= 3 evaluaciones. |
| `AverageBar` | Barra horizontal de progreso para cada dimensión. Color según el promedio (rojo < 3, ámbar 3, verde > 3). |
| `AnonConfirmModal` | Modal antes de enviar: "Tu evaluación es completamente anónima. Una vez enviada no puede modificarse. ¿Continuar?" |
| `PeriodBanner` | Banner informativo en el dashboard que muestra el nombre del período activo y la fecha de cierre. Desaparece si no hay período activo. |
| `SeedModeBanner` | Banner amarillo estándar del curso. Solo admin. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo. Ranking en tabla completa. Dashboard con 2 columnas. |
| Tablet (768–1023px) | Sidebar colapsable. Ranking con scroll horizontal. |
| Celular (<768px) | Bottom navigation. `DimensionRating` con botones grandes (44px mín). Ranking en lista vertical. |

---

## 19. Plan de fases de implementación

### Fase 1 — Bootstrap, Login, Registro y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg resend @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado. Crear cuenta en Resend. Configurar todas las variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin (password `admin123` hasheado) y `system_config` con dominio por defecto. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql` con `users`, `activation_tokens`, `password_reset_tokens`, `system_config`, `_migrations`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/emailService.ts`: `sendVerificationEmail`, `sendPasswordResetEmail`, `sendPeriodOpenNotification`. |
| 1.7 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios (incluye `createUser`, `activateUser`, `createPasswordResetToken`, `resetPassword`) y `recordAudit`. |
| 1.8 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. |
| 1.9 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.10 | Crear `lib/types.ts` y `lib/schemas.ts` con tipos y schemas de auth (validación de dominio institucional en el schema de registro). |
| 1.11 | Crear API Routes: `POST /api/system/bootstrap`, `GET /api/system/diagnose`, `GET /api/system/mode`, `POST /api/auth/login` (con bloqueo por intentos — 5 fallidos → 15 min), `POST /api/auth/register` (valida dominio, envía verificación), `POST /api/auth/verify` (activa cuenta), `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/change-password`. |
| 1.12 | Crear `app/login/page.tsx`, `app/register/page.tsx`, `app/verify/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx` con la identidad visual de EvalDoc. |
| 1.13 | Actualizar `app/page.tsx`: página pública de landing (sin login requerido). |
| 1.14 | `npm run typecheck` sin errores. Probar: registro con dominio correcto → correo de verificación en Resend → activar cuenta → login → cookie HttpOnly → modo seed. Probar: registro con dominio incorrecto → debe rechazarse. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta institucional en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar (desktop), bottom nav (mobile). El estudiante ve Inicio, Evaluar, Ranking, Perfil. El admin ve además Administración. |
| 2.4 | Crear `/admin/db-setup/page.tsx`: diagnóstico (Supabase, Blob, Resend test, migrations) + bootstrap. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `GET /api/dashboard`: período activo, lista de profesores con progreso del estudiante (usando hashes), estadísticas básicas. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx`: `PeriodBanner`, `ProgressTracker` y lista de profesores con badges (placeholder hasta Fase 5). |
| 2.8 | Crear `middleware.ts`: protege rutas privadas, `/admin/*` solo para `role = 'admin'`. Las páginas de ranking y perfiles de profesores son públicas — no protegerlas. |
| 2.9 | Probar: bootstrap → cambiar dominio en `/admin/config` a un dominio de prueba → registrar estudiante con ese dominio → activar → login. |

---

### Fase 3 — Gestión de Profesores
> Rol: Ingeniero Backend Senior

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_professors.sql`. Aplicar desde `/admin/db-setup`. |
| 3.2 | Agregar tipos `Professor`, `CreateProfessorRequest`, `UpdateProfessorRequest` y schemas Zod. |
| 3.3 | Extender `dataService`: `getProfessors`, `getProfessorById`, `createProfessor`, `updateProfessor`, `deactivateProfessor` (verifica evaluaciones antes — RN-08). |
| 3.4 | API Routes: `GET /api/professors` (público), `GET /api/professors/[id]` (público), `POST/GET /api/admin/professors` (admin), `PUT /api/admin/professors/[id]` (admin), `DELETE /api/admin/professors/[id]` → en realidad soft delete (admin). |
| 3.5 | Crear `app/admin/professors/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`. |
| 3.6 | Verificar RN-08: intentar desactivar un profesor que tiene evaluaciones → el sistema debe retornar 409 con mensaje de advertencia y ofrecer soft delete. |

---

### Fase 4 — Gestión de Períodos
> Rol: Ingeniero Fullstack Senior

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_periods.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Period`, `CreatePeriodRequest`, schemas Zod (fecha inicio < fin, RN-11: no solapamiento). |
| 4.3 | Extender `dataService`: `getActivePeriod` (query por fechas — fuente de verdad son las fechas, no el status), `getPeriods`, `createPeriod` (verifica solapamiento), `updatePeriod`, `closePeriod`. |
| 4.4 | `getActivePeriod` hace: `SELECT * FROM periods WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE ORDER BY start_date DESC LIMIT 1`. Si existe, retorna el período. Si no, retorna null. No depende del campo `status`. |
| 4.5 | API Routes: `GET /api/periods/active` (público), `GET/POST /api/admin/periods` (admin), `PUT/DELETE /api/admin/periods/[id]` (admin), `POST /api/admin/periods/[id]/notify` (envía correo masivo a estudiantes activos con Resend). |
| 4.6 | Crear `app/admin/periods/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`. |
| 4.7 | Integrar `PeriodBanner` en el dashboard con datos reales del período activo. |
| 4.8 | Verificar RN-11: crear dos períodos con fechas solapadas → el segundo debe retornar 409. |

---

### Fase 5 — Evaluaciones Anónimas y Sistema de Anonimización
> Rol: Ingeniero Fullstack Senior — Módulo más crítico del sistema

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0004_init_evaluations.sql` con `evaluations` (sin student_id), `evaluation_tokens` y la VIEW `professor_period_stats`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Crear `lib/anonymizationService.ts`: `computeEvaluationToken` (SHA256 con módulo `crypto` nativo de Node), `verifyNotDuplicate`. |
| 5.3 | Crear `lib/evaluationService.ts`: `calculateAverages`, `buildRanking`. |
| 5.4 | Agregar tipos `SubmitEvaluationRequest`, `PublicRankingItem`, `PublicProfessorProfile`, `StudentProgress` y schemas Zod (RN-04, RN-09). |
| 5.5 | Extender `dataService`: `submitEvaluation` (secuencia completa: verificar período → verificar hash → insertar evaluation sin student_id → insertar token → calcular avg), `getStudentProgress` (para cada profesor del período, computar hash y verificar existencia), `hasStudentEvaluated`, `getPublicRanking` (JOIN con VIEW, filtrado por >= min_evaluations), `getPublicProfessorProfile`. |
| 5.6 | API Routes: `POST /api/evaluate` (autenticado estudiante), `GET /api/professors/[id]/progress` (verifica si el estudiante autenticado evaluó ese profesor), `GET /api/ranking` (público), `GET /api/professors/[id]` con promedios (público, null si < 3 evaluaciones). |
| 5.7 | Crear `app/evaluate/[professorId]/page.tsx`: `EvaluationForm` con `DimensionRating` por cada una de las 5 dimensiones, comentario opcional, `AnonConfirmModal` antes de enviar. |
| 5.8 | Conectar el dashboard del estudiante con datos reales: lista de profesores del período con badges Evaluado/Pendiente usando `getStudentProgress`. |
| 5.9 | Crear `app/ranking/page.tsx` (pública): `RankingTable` con `AverageBar` por dimensión. |
| 5.10 | Crear `app/professors/[id]/page.tsx` (pública): perfil del profesor con promedios por dimensión. Si < 3 evaluaciones, mostrar "Aún no hay suficientes evaluaciones para publicar resultados." |
| 5.11 | Probar el anonimato directamente en Supabase: verificar que la tabla `evaluations` no tiene columna `student_id`. Intentar una consulta SQL que vincule evaluaciones con estudiantes → debe ser imposible. |
| 5.12 | Probar RN-02: enviar la misma evaluación dos veces → segunda debe retornar 409. |
| 5.13 | Probar RN-06: crear menos de 3 evaluaciones para un profesor → no debe aparecer en el ranking. Agregar la tercera → debe aparecer. |

---

### Fase 6 — Reportes, Moderación y Configuración
> Rol: Ingeniero Fullstack Senior + Diseñador Frontend

| # | Tarea |
|---|---|
| 6.1 | Extender `dataService`: `getAdminReport` (evaluaciones con promedios por dimensión, sin student_id, filtros por profesor/materia/período), `getComments` (comentarios visibles, con moderación), `deleteComment` (soft delete — marcar `comment_is_visible = false`), `updateSystemConfig`. |
| 6.2 | API Routes (admin): `GET /api/admin/reports` con filtros, `GET /api/admin/comments`, `DELETE /api/admin/comments/[id]`, `GET/PUT /api/admin/config`. |
| 6.3 | Crear `app/admin/reports/page.tsx`: filtros de profesor, materia y período. Tabla con: nombre del profesor, dimensiones con promedios, conteo de evaluaciones y promedio general. |
| 6.4 | Crear `app/admin/comments/page.tsx`: lista paginada de comentarios con botón de eliminar y confirmación. Los comentarios eliminados se marcan como moderados (no desaparecen del historial del admin pero no aparecen en el ranking público). |
| 6.5 | Crear `app/admin/config/page.tsx`: formulario con `institution_name`, `allowed_domain` y `min_evaluations_to_publish`. Advertencia antes de cambiar el dominio: "Cambiar el dominio afectará los futuros registros. Los estudiantes ya registrados conservan su acceso." |
| 6.6 | Crear `app/admin/users/page.tsx`: tabla de estudiantes registrados con email, estado (activo/pendiente verificación/bloqueado) y fecha de registro. Acciones: activar/desactivar. |
| 6.7 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con selector de mes. |

---

### Fase 7 — Pulido final y Deploy
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 7.1 | Auditoría de empty states: sin período activo (mensaje en dashboard y en el formulario de evaluación), ranking sin datos suficientes ("Aún no hay resultados publicados para este período"), reportes sin evaluaciones para los filtros aplicados. |
| 7.2 | Manejo de errores global: 401 (sesión expirada → redirect a login), 403 (período no activo → "El período de evaluación está cerrado"), 409 (ya evaluado → "Ya evaluaste a este profesor en este período"), 500. |
| 7.3 | Verificar el flujo completo de recuperación de contraseña: solicitar link → recibir correo en Resend → hacer clic → ingresar nueva contraseña → login con nueva contraseña. Verificar que el link expira en 15 minutos. |
| 7.4 | Verificar que el ranking y los perfiles de profesores son accesibles sin login (rutas públicas). |
| 7.5 | Verificar el anonimato en producción: completar el flujo de evaluación → ir a Supabase Table Editor → verificar que la tabla `evaluations` no tiene `student_id` y que `evaluation_tokens` solo tiene hashes. |
| 7.6 | Verificar el dominio institucional: registrar con un correo de Gmail → debe rechazarse. |
| 7.7 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 7.8 | Deploy en Vercel con todas las variables de entorno. |
| 7.9 | Probar el flujo completo en producción: bootstrap → configurar dominio → crear período → crear profesores → registrar estudiante → verificar correo → evaluar profesores → ver ranking (cuando hay >= 3 evaluaciones) → admin modera comentario. |

---

## 20. Estrategia de seguridad

### Flujo de login con bloqueo por intentos

```
1. Validar body con Zod
2. getUserByEmail(email)
3. Si locked_until > NOW() → retornar 429 "Cuenta bloqueada por X min"
4. Si !is_active → retornar 401 "Cuenta pendiente de verificación"
5. bcrypt.compare(password, hash)
6. Si falla: incrementLoginAttempts → si >= 5: SET locked_until = NOW() + 15 min
   Retornar mensaje genérico (nunca especificar si es el correo o la contraseña)
7. Si éxito: resetLoginAttempts → JWT({ userId, role, email }, 24h) → cookie HttpOnly
8. recordAudit (solo para admin)
```

### Flujo de registro con validación de dominio

```
1. Validar body (Zod: email formato, password fuerza)
2. Extraer dominio del email: email.split('@')[1]
3. Comparar con system_config.allowed_domain
4. Si no coincide: retornar 400 "Solo se aceptan correos [allowed_domain]"
5. Verificar que el email no existe (UNIQUE constraint)
6. Crear usuario con is_active = false
7. Generar token aleatorio (32 bytes hex con crypto.randomBytes)
8. Insertar en activation_tokens con expires_at = NOW() + 24h
9. emailService.sendVerificationEmail(email, token)
10. Retornar { message: "Revisa tu correo para activar tu cuenta" }
```

### Garantía de anonimato en el código

La función `submitEvaluation` en `dataService` es la única que sabe el `student_id` del evaluador (viene del JWT). Es la última vez que ese dato aparece en la cadena:
- El INSERT a `evaluations` no incluye `student_id`.
- El INSERT a `evaluation_tokens` incluye solo el hash.
- La auditoría de la operación no registra `user_id`.

Después de que retorna `submitEvaluation`, el `student_id` del evaluador desaparece del sistema para esa evaluación — para siempre.

---

## 21. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Anonimato irreversible | Una evaluación enviada no puede modificarse ni eliminarse. La identidad del evaluador no puede recuperarse. |
| RS-02 | Sin período = sin evaluaciones | Si no hay un período activo (por fechas), el formulario de evaluación está deshabilitado. |
| RS-03 | Solo un período activo a la vez | Las fechas de los períodos no pueden solaparse (RN-11). |
| RS-04 | Sin registro de correos externos | Solo el dominio institucional configurado por el admin puede registrarse. |
| RS-05 | Los comentarios moderados no se eliminan | Se marcan con `comment_is_visible = false`. El admin puede verlos pero no aparecen en el ranking público. |
| RS-06 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login admin. |

---

## 22. Glosario

| Término | Definición |
|---|---|
| **Evaluación** | Conjunto de calificaciones (1–5) en 5 dimensiones más un comentario opcional, enviado sobre un profesor específico en un período activo. |
| **Dimensión** | Aspecto del desempeño docente que se evalúa: claridad, metodología, puntualidad, trato al estudiante y dominio del tema. |
| **Período académico** | Ventana de tiempo configurada por el admin durante la cual los estudiantes pueden enviar evaluaciones. |
| **Anonimato por diseño** | Garantía técnica de que la identidad del evaluador no puede recuperarse desde la base de datos, incluso con acceso directo. |
| **Token de control** | Hash SHA256 unidireccional almacenado en `evaluation_tokens` para detectar duplicados sin revelar la identidad del estudiante. |
| **Hash unidireccional** | Resultado de una función criptográfica que no puede revertirse: dado el hash, es imposible obtener los datos originales. |
| **Ranking público** | Lista de profesores ordenada por promedio general, accesible sin autenticación. Solo incluye profesores con >= 3 evaluaciones. |
| **Dominio institucional** | Sufijo de correo electrónico aceptado para el registro (ej: `@corhuila.edu.co`). Configurable por el admin. |
| **Moderación** | Acción del admin de marcar un comentario como no visible por incumplir normas de convivencia. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones del admin. |
| **Resend** | Servicio de correo transaccional para verificación de cuenta, recuperación de contraseña y notificación de períodos. |

---

> Última actualización: Mayo 2026
> Shayla Bueno — Doc: 1082919469
> Curso: Lógica y Programación — SIST0200
