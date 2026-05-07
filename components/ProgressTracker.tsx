interface ProgressTrackerProps {
  evaluated: number;
  total: number;
}

export function ProgressTracker({ evaluated, total }: ProgressTrackerProps) {
  const percentage = total > 0 ? Math.round((evaluated / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tu Progreso</h3>
        <span className="text-sm text-gray-500">
          {evaluated} de {total} evaluados
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {percentage}% completado
      </p>
    </div>
  );
}