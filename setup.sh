#!/bin/bash
# Script para instalar, compilar y desplegar a Vercel

echo "🚀 Iniciando proceso de setup..."

# Paso 1: Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Paso 2: Validar TypeScript
echo "✅ Validando TypeScript..."
npm run typecheck

# Paso 3: Build
echo "🔨 Compilando proyecto..."
npm run build

# Paso 4: Mensaje de éxito
echo "✨ ¡Compilación exitosa!"
echo ""
echo "📋 Próximos pasos:"
echo "1. npm run dev     (para desarrollo local en http://localhost:3000)"
echo "2. npm run start   (para test de servidor de producción)"
echo ""
echo "🌍 Para desplegar en Vercel:"
echo "  git add ."
echo "  git commit -m 'chore: ready for vercel deployment'"
echo "  git push origin main"
echo ""
echo "  Luego ve a https://vercel.com para importar este repositorio"
