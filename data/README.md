# Capa de Datos JSON

## Propósito

Esta carpeta `/data` actúa como una **base de datos pseudo-relacional** basada en archivos JSON. Es una alternativa ligera a bases de datos tradicionales, ideal para proyectos fullstack con datos estructurados y estáticos.

## Estructura

```
/data/
  ├── config.json      - Configuración global de la aplicación
  ├── home.json        - Contenido de la página Home/Hola Mundo
  └── README.md        - Este archivo
```

## Regla de Oro — Server-Only Access

⚠️ **CRÍTICO:** Los archivos en `/data` solo se leen desde:
- ✅ Server Components (`app/page.tsx` sin "use client")
- ✅ API Routes (`app/api/*/route.ts`)
- ✅ Funciones de servidor (`lib/dataService.ts`)

🚫 **NUNCA:**
- Desde componentes cliente ("use client")
- Desde acceso directo en el navegador

## Cómo agregar nuevos archivos JSON

1. Crear archivo `.json` en esta carpeta (ej: `about.json`)
2. Definir la interfaz TypeScript en `/lib/types.ts`
3. Crear el schema Zod en `/lib/validators.ts`
4. Implementar función de lectura en `/lib/dataService.ts`
5. Usar en un Server Component o API Route

Ejemplo:
```typescript
// lib/dataService.ts
export async function readAboutData(): Promise<AboutData> {
  return readJsonFile<AboutData>('about.json', AboutDataSchema);
}
```

## Tipado y Validación

Cada archivo JSON tiene:
1. **Interfaz TypeScript** — Estructura esperada
2. **Schema Zod** — Validación en tiempo de ejecución

Esto garantiza que los datos siempre sean válidos antes de usarlos.

## Performance

- Los archivos se leen en tiempo de build cuando es posible
- En desarrollo, se cachean en memoria
- En producción en Vercel, se incluyen en el bundle

---

*Actualizar este archivo cuando se agreguen nuevos archivos de datos.*
