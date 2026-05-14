# 📊 Estado de Ejecución — EvalDoc

> **Proyecto:** EvalDoc — Plataforma de Evaluaciones Anónimas de Profesores  
> **Versión:** 1.0  
> **Inicio:** Mayo 2026

---

## 🎯 Dashboard Progreso

| Fase | Nombre | Estado | Inicio | Cierre | Resumen |
|------|--------|--------|--------|--------|---------|
| 1 | Bootstrap, Login, Registro y dataService base | ✅ Completada | Mayo 2026 | Mayo 2026 | RESUMEN_FASE_1_BOOTSTRAP.md |
| 2 | Dashboard, Layout base y página de bootstrap | ✅ Completada | 7/05/2026 | 7/05/2026 | RESUMEN_FASE_2_DASHBOARD.md |
| 3 | Gestión de Profesores | ✅ Completada | 7/05/2026 | 7/05/2026 | RESUMEN_FASE_3_PROFESORES.md |
| 4 | Gestión de Períodos y Notificación Masiva | 🔄 En Progreso | 7/05/2026 | TBD | RESUMEN_FASE_4_PERIODOS.md |

---

## 🔵 FASE 3 — Gestión de Profesores

> **Rol:** Ingeniero Backend Senior  
> **Objetivo:** Implementar catálogo de profesores con integridad referencial

### [ INICIO ]
- **Fecha/Hora:** 7/05/2026 — Iniciando implementación

### [ CIERRE ]
- **Fecha/Hora:** TBD

### 📋 Acciones Ejecutadas
- [ ] Crear migration 0002_init_professors.sql
- [ ] Agregar tipos Professor y schemas Zod
- [ ] Extender dataService con funciones de profesores
- [ ] Crear API routes para gestión de profesores
- [ ] Crear páginas admin para CRUD de profesores
- [ ] Implementar RN-08: soft delete si hay evaluaciones
- [ ] Probar creación, desactivación, reactivación
- [ ] npm run typecheck

### 📦 Archivos Creados/Modificados
- `supabase/migrations/0002_init_professors.sql`
- `lib/types.ts` — tipos Professor
- `lib/schemas.ts` — schemas Zod
- `lib/dataService.ts` — funciones de profesores
- `app/api/professors/route.ts` — API público
- `app/api/admin/professors/` — APIs admin
- `app/admin/professors/` — páginas admin

### ⚠️ Observaciones
- GET /api/professors es público
- deactivateProfessor verifica evaluaciones antes de proceder
- Profesores inactivos: badge rojo en admin, no aparecen en público

### 📄 Resumen Generado
- Archivo: `doc/RESUMEN_FASE_3_PROFESORES.md` — [pendiente]

---

## 🔵 FASE 4 — Gestión de Períodos y Notificación Masiva

> **Rol:** Ingeniero Fullstack Senior  
> **Objetivo:** Implementar gestión de períodos académicos con activación automática por fechas

### [ INICIO ]
- **Fecha/Hora:** 7/05/2026 — Iniciando implementación

### [ CIERRE ]
- **Fecha/Hora:** TBD

### 📋 Acciones Ejecutadas
- [ ] Crear migration 0003_init_periods.sql con is_manually_closed
- [ ] Agregar tipos Period y schemas Zod
- [ ] Extender dataService con funciones de períodos (getActivePeriod con query exacta)
- [ ] Crear API routes para gestión de períodos
- [ ] Crear páginas admin para CRUD de períodos
- [ ] Implementar RN-11: no solapamiento de fechas
- [ ] Implementar POST /api/admin/periods/[id]/notify con delay 100ms
- [ ] Integrar PeriodBanner con datos reales
- [ ] Probar creación, cierre manual, notificación masiva
- [ ] npm run typecheck

### 📦 Archivos Creados/Modificados
- `supabase/migrations/0003_init_periods.sql`
- `lib/types.ts` — tipos Period
- `lib/schemas.ts` — schemas Zod
- `lib/dataService.ts` — funciones de períodos
- `app/api/periods/active/route.ts` — API público
- `app/api/admin/periods/` — APIs admin
- `app/admin/periods/` — páginas admin
- `components/PeriodBanner.tsx` — integración con datos reales

### ⚠️ Observaciones
- getActivePeriod usa query por fechas, no status
- is_manually_closed permite cierre manual antes de end_date
- Notificación masiva respeta rate limits de Resend (100ms delay)
- Date pickers en zona horaria local, servidor guarda DATE

### 📄 Resumen Generado
- Archivo: `doc/RESUMEN_FASE_4_PERIODOS.md` — [pendiente]

> **Rol:** Diseñador Frontend Obsesivo + Ingeniero de Sistemas  
> **Objetivo:** Implementar layout base, dashboard y página de bootstrap

### [ INICIO ]
- **Fecha/Hora:** 7/05/2026 — Iniciando implementación

### [ CIERRE ]
- **Fecha/Hora:** TBD

### 📋 Acciones Ejecutadas
- [ ] Configurar variables CSS de la paleta institucional en `globals.css`. Inter con `next/font`.
- [ ] Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table.
- [ ] Crear `AppLayout.tsx`: sidebar (desktop), bottom nav (mobile). El estudiante ve Inicio, Evaluar, Ranking, Perfil. El admin ve además Administración.
- [ ] Crear `/admin/db-setup/page.tsx`: diagnóstico (Supabase, Blob, Resend test, migrations) + bootstrap.
- [ ] Crear `SeedModeBanner.tsx`.
- [ ] Crear `GET /api/dashboard`: período activo, lista de profesores con progreso del estudiante (usando hashes), estadísticas básicas. En modo seed retorna estructura vacía.
- [ ] Crear `app/dashboard/page.tsx`: `PeriodBanner`, `ProgressTracker` y lista de profesores con badges (placeholder hasta Fase 5).
- [ ] Crear `middleware.ts`: protege rutas privadas, `/admin/*` solo para `role = 'admin'`. Las páginas de ranking y perfiles de profesores son públicas — no protegerlas.
- [ ] Actualizar `app/page.tsx` para mostrar institución, período activo, ranking público.
- [ ] Probar rutas públicas y privadas, bootstrap completo.

### 📦 Archivos Creados/Modificados
- `globals.css` — paleta de colores y fuente Inter
- `components/` — componentes UI base
- `components/AppLayout.tsx` — layout con sidebar
- `components/SeedModeBanner.tsx` — banner modo seed
- `components/PeriodBanner.tsx` — banner período activo
- `components/ProgressTracker.tsx` — tracker de progreso
- `app/admin/db-setup/page.tsx` — página de bootstrap
- `app/dashboard/page.tsx` — dashboard estudiante
- `app/api/dashboard/route.ts` — API dashboard
- `middleware.ts` — protección de rutas
- `app/page.tsx` — landing pública

### 🔧 Comandos Ejecutados
- `npm run typecheck` — validación final

### ⚠️ Observaciones
- Layout responsivo: sidebar desktop, bottom nav mobile
- Rutas públicas: /, /ranking, /professors/[id], /login, /register, /verify, /forgot-password, /reset-password
- Rutas protegidas: /dashboard, /evaluate/*, /profile, /admin/*

### 📄 Resumen Generado
- Archivo: `doc/RESUMEN_FASE_2_DASHBOARD.md` — [pendiente]