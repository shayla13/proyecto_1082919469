'use client';

import { getSystemMode } from '@/lib/dataService';

export function SeedModeBanner() {
  const isSeedMode = getSystemMode() === 'seed';

  if (!isSeedMode) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            ⚠️
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">
              Modo Seed Activo
            </p>
            <p className="text-sm text-yellow-700">
              El sistema está ejecutándose en modo de desarrollo con datos locales.
              Los cambios no se persisten permanentemente.
            </p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}