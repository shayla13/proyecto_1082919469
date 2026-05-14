'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
=======
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PeriodBanner } from '@/components/PeriodBanner';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

interface DashboardData {
  period: {
    name: string;
    endDate: string;
  } | null;
  professors: Array<{
    id: number;
    name: string;
    subject: string;
    department: string;
    evaluated: boolean;
  }>;
  progress: {
    evaluated: number;
    total: number;
  };
  stats: {
    totalEvaluations: number;
    averageRating: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </AppLayout>
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    );
  }

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Bienvenido, {user?.name}
        </h1>

        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 mb-4">Dashboard de Fase 1 - Placeholder</p>
          <p className="text-gray-700">
            Email: {user?.email}
          </p>
          <p className="text-gray-700">
            Rol: {user?.role}
          </p>
        </div>
      </div>
    </main>
  );
}
=======
    <AppLayout>
      {data?.period && (
        <PeriodBanner
          periodName={data.period.name}
          endDate={data.period.endDate}
        />
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido a EvalDoc. Aquí puedes ver tu progreso y acceder a las evaluaciones.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tu Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressTracker
                evaluated={data?.progress.evaluated || 0}
                total={data?.progress.total || 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Evaluaciones totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.stats.totalEvaluations || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Calificación promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.stats.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Período</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.period ? (
                <div className="text-center">
                  <Badge variant="success">Activo</Badge>
                  <p className="mt-2 text-sm text-gray-600">
                    {data.period.name}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Badge variant="warning">Inactivo</Badge>
                  <p className="mt-2 text-sm text-gray-600">
                    No hay período activo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profesores a Evaluar</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.professors && data.professors.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.professors.map((professor) => (
                  <div
                    key={professor.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {professor.name}
                      </h3>
                      <Badge variant={professor.evaluated ? 'success' : 'warning'}>
                        {professor.evaluated ? 'Evaluado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {professor.subject}
                    </p>
                    <p className="text-sm text-gray-500">
                      {professor.department}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No hay profesores para evaluar"
                description="En este momento no hay un período de evaluación activo o no hay profesores registrados."
                icon="👨‍🏫"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
