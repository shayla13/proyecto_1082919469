'use client';

interface Period {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface PeriodBannerProps {
  period: Period;
}

export function PeriodBanner({ period }: PeriodBannerProps) {
  const endDate = new Date(period.end_date);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formattedDate = endDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-300 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl">📅</div>
          <div>
            <h2 className="text-lg font-bold text-blue-900">
              Período Activo: {period.name}
            </h2>
            <p className="text-sm text-blue-700">
              Las evaluaciones cierran el {formattedDate}
              {daysLeft > 0 && ` (${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} restantes)`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-blue-900">
            {daysLeft > 0 ? '⏰ Activo' : '❌ Cerrado'}
          </p>
        </div>
      </div>
    </div>
  );
}
  );
}