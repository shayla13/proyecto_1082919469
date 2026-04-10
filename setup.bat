@echo off
REM Script para instalar, compilar y desplegar a Vercel

echo.
echo ======================================
echo 🚀 Iniciando proceso de setup...
echo ======================================
echo.

REM Paso 1: Instalar dependencias
echo 📦 Paso 1: Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ❌ Error en instalación de dependencias
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.

REM Paso 2: Validar TypeScript
echo ✅ Paso 2: Validando TypeScript...
call npm run typecheck
if errorlevel 1 (
    echo ❌ Error en validación de TypeScript
    exit /b 1
)
echo ✅ TypeScript validado

echo.

REM Paso 3: Build
echo 🔨 Paso 3: Compilando proyecto...
call npm run build
if errorlevel 1 (
    echo ❌ Error en compilación
    exit /b 1
)
echo ✅ Proyecto compilado

echo.
echo ======================================
echo ✨ ¡Compilación exitosa!
echo ======================================
echo.

echo 📋 Próximos pasos:
echo.
echo   Para desarrollo local:
echo   npm run dev
echo.
echo   Para probar servidor de producción:
echo   npm run build && npm run start
echo.
echo   Para desplegar en Vercel:
echo   1. git add .
echo   2. git commit -m "chore: ready for vercel deployment"
echo   3. git push origin main
echo   4. Ve a https://vercel.com/new y importa el repositorio
echo.
pause
