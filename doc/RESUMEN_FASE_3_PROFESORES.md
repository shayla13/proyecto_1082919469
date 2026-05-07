# 📋 Resumen Fase 3 — Gestión de Profesores

## Objetivo
Implementar la capa de datos y API pública/admin para la gestión de profesores, respetando la integridad referencial y la regla RN-08.

## Qué se hizo
- Agregado `supabase/migrations/0002_init_professors.sql` con tabla `professors`.
- Extendidos los tipos en `lib/types.ts` con `Professor`, `CreateProfessorRequest`, `UpdateProfessorRequest`.
- Añadidos schema Zod en `lib/schemas.ts` para validar creación y actualización de profesores.
- Extendido `lib/dataService.ts` con:
  - `getProfessors()` público que retorna solo profesores activos.
  - `getProfessorById(id)` público.
  - `getAllProfessors()` admin que retorna todos los profesores.
  - `createProfessor(data)`.
  - `updateProfessor(id, data)`.
  - `deactivateProfessor(id)` que cumple RN-08 al verificar evaluaciones antes de desactivar.
  - `reactivateProfessor(id)` para reactivar soft deleted professors.
- Creada API pública `GET /api/professors` y `GET /api/professors/[id]`.
- Creada API admin `GET /api/admin/professors`, `POST /api/admin/professors`, `PUT /api/admin/professors/[id]`, `DELETE /api/admin/professors/[id]`.
- Implementada autenticación admin en rutas admin usando `lib/withAuth.ts`.
- Añadido soporte seed para `professors` en `data/seed.json` y `lib/validators.ts`.

## Estado actual
- Backend de profesores implementado y verificado con `npm run typecheck`.
- No se creó UIs admin de profesores, ya que el alcance solicitado fue backend.

## Notas
- `GET /api/professors` es público.
- `DELETE /api/admin/professors/[id]` es soft delete y retorna `409` cuando el profesor tiene evaluaciones.
- `professors` en modo seed se inicializa vacío en `data/seed.json`.
