interface PeriodBannerProps {
  periodName: string;
  endDate: string;
}

export function PeriodBanner({ periodName, endDate }: PeriodBannerProps) {
  const formattedDate = new Date(endDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            📅
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">
              Período Activo: {periodName}
            </p>
            <p className="text-sm text-blue-700">
              Las evaluaciones cierran el {formattedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}