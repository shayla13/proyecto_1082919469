'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PeriodBanner } from '@/components/PeriodBanner';
import { ProgressTracker } from '@/components/ProgressTracker';
import { EmptyState } from '@/components/EmptyState';

interface Period {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface StudentProgress {
  evaluated: number;
  total: number;
  evaluated_professors: string[];
  pending_professors: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // Obtener usuario actual
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        // Obtener período activo
        const periodRes = await fetch('/api/periods/active');
        if (periodRes.ok) {
          const periodData = await periodRes.json();
          setPeriod(periodData);

          // Si hay período activo, obtener progreso del estudiante
          if (periodData) {
            const progressRes = await fetch(
              `/api/students/progress?periodId=${periodData.id}`
            );
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              setProgress(progressData);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      {/* Period Banner */}
      {period && (
        <PeriodBanner
          period={{
            id: period.id,
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date,
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600 mb-8">{user?.email}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* No period active */}
        {!period && (
          <EmptyState
            title="No hay un período de evaluación activo"
            description="Cuando la institución abra un nuevo período, podrás evaluar a tus profesores desde aquí."
            icon="📅"
          />
        )}

        {/* Period active */}
        {period && progress && (
          <div className="space-y-8">
            {/* Progress Tracker */}
            <ProgressTracker
              evaluated={progress.evaluated}
              total={progress.total}
            />

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Profesores Evaluados ({progress.evaluated})
                </h2>
                {progress.evaluated_professors.length === 0 ? (
                  <p className="text-gray-600">
                    Aún no has evaluado a ningún profesor
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {progress.evaluated_professors.map((name) => (
                      <li key={name} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Pendientes ({progress.pending_professors.length})
                </h2>
                {progress.pending_professors.length === 0 ? (
                  <p className="text-gray-600 text-green-600">
                    ¡Has evaluado a todos los profesores!
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {progress.pending_professors
                      .slice(0, 5)
                      .map((name) => (
                        <li key={name} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2" />
                          {name}
                        </li>
                      ))}
                    {progress.pending_professors.length > 5 && (
                      <li className="text-gray-500 text-sm">
                        +{progress.pending_professors.length - 5} más
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* CTA */}
            {progress.pending_professors.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  ¡Continúa evaluando!
                </h3>
                <p className="text-blue-800 mb-4">
                  Tienes {progress.pending_professors.length} profesor(es) pendiente(s) de evaluar.
                </p>
                <a
                  href="/evaluate"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                >
                  Ir a evaluar
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
          <p className="text-gray-700">
            Rol: {user?.role}
          </p>
        </div>
      </div>
    </main>
  );
}
