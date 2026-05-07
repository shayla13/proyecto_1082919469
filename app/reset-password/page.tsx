'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No se encontró token de recuperación.');
    }
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('No se encontró token de recuperación.');
      return;
    }

    setLoading(true);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || payload.error || 'No se pudo restablecer la contraseña.');
    } else {
      setMessage('Contraseña actualizada. Redirigiendo al login...');
      setTimeout(() => router.push('/login'), 2000);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-sky-600 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white text-2xl shadow-lg">
            ★
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Restablecer contraseña</h1>
          <p className="mt-2 text-sm text-slate-600">Crea una nueva contraseña segura para tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nueva contraseña</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Mínimo 8 caracteres"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Procesando...' : 'Actualizar contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/login" className="text-sky-600 hover:underline">
            Volver al login
          </Link>
        </div>
      </section>
    </main>
  );
}
