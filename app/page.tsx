import Link from 'next/link';
import { getSystemConfig, getActivePeriod } from '@/lib/dataService';
import { PeriodBanner } from '@/components/PeriodBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';

export default async function HomePage() {
  const systemConfig = await getSystemConfig();
  const activePeriod = await getActivePeriod();

  // TODO: Obtener ranking público cuando haya evaluaciones
  const ranking: Array<{
    id: number;
    name: string;
    subject: string;
    department: string;
    averageRating?: number;
    evaluationCount: number;
  }> = []; // Placeholder

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {activePeriod && (
        <PeriodBanner
          periodName={activePeriod.name}
          endDate={activePeriod.end_date}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <span className="text-3xl font-bold">★</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">EvalDoc</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {systemConfig.institution_name}
              </h1>
            </div>
          </div>

          <p className="max-w-2xl mx-auto text-gray-600 leading-8 text-lg mb-8">
            Tu opinión mejora la educación. Evalúa a tus profesores de forma completamente anónima
            y contribuye a un ranking transparente que beneficia a toda la comunidad estudiantil.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Crear cuenta
            </Link>
          </div>
        </section>

        {/* Ranking Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Ranking de Profesores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ranking && ranking.length > 0 ? (
                <div className="space-y-4">
                  {ranking.map((professor, index) => (
                    <div
                      key={professor.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {professor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {professor.subject} • {professor.department}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {professor.averageRating?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {professor.evaluationCount} evaluaciones
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activePeriod ? (
                <EmptyState
                  title="Aún no hay resultados publicados"
                  description="Participa en la evaluación cuando el período esté activo para ver los primeros resultados."
                  icon="📊"
                />
              ) : (
                <EmptyState
                  title="No hay un período de evaluación activo en este momento"
                  description="Los resultados aparecerán cuando se abra un nuevo período de evaluación."
                  icon="📅"
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
