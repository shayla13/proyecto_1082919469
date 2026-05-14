'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { AppLayout } from '@/components/AppLayout';

interface SystemStatus {
  supabase: boolean;
  blob: boolean;
  resend: boolean;
  migrations: boolean;
}

export default function DbSetupPage() {
  const [status, setStatus] = useState<SystemStatus>({
    supabase: false,
    blob: false,
    resend: false,
    migrations: false,
  });
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/diagnose');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    try {
      const response = await fetch('/api/system/bootstrap', {
        method: 'POST',
      });
      if (response.ok) {
        alert('Sistema bootstrappeado exitosamente');
        await checkSystemStatus();
      } else {
        const error = await response.text();
        alert(`Error en bootstrap: ${error}`);
      }
    } catch (error) {
      console.error('Error bootstrapping:', error);
      alert('Error en bootstrap');
    } finally {
      setBootstrapping(false);
    }
  };

  const allSystemsOk = status.supabase && status.blob && status.resend && status.migrations;

  return (
    <AppLayout userRole="admin">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Verifica el estado de los servicios y configura la base de datos inicial.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Servicios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Supabase</span>
                <Badge variant={status.supabase ? 'success' : 'error'}>
                  {status.supabase ? '✅ OK' : '❌ Error'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Vercel Blob</span>
                <Badge variant={status.blob ? 'success' : 'error'}>
                  {status.blob ? '✅ OK' : '❌ Error'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Resend</span>
                <Badge variant={status.resend ? 'success' : 'error'}>
                  {status.resend ? '✅ OK' : '❌ Error'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Migraciones</span>
                <Badge variant={status.migrations ? 'success' : 'error'}>
                  {status.migrations ? '✅ OK' : '❌ Error'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={checkSystemStatus}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Verificando...' : 'Verificar Estado'}
              </Button>

              <Button
                onClick={handleBootstrap}
                disabled={bootstrapping || allSystemsOk}
                className="w-full"
              >
                {bootstrapping ? 'Bootstrapping...' : 'Ejecutar Bootstrap'}
              </Button>

              {allSystemsOk && (
                <div className="text-center text-green-600 font-medium">
                  ✅ Sistema listo para producción
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Verifica que todas las variables de entorno estén configuradas</li>
              <li>Ejecuta "Verificar Estado" para chequear los servicios</li>
              <li>Si hay errores, revisa la configuración y vuelve a verificar</li>
              <li>Una vez que todos los servicios estén OK, ejecuta "Bootstrap"</li>
              <li>El bootstrap crea las tablas iniciales y datos de seed</li>
              <li>Después del bootstrap, el sistema estará listo para usar</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
