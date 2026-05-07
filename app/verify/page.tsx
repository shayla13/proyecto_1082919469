'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verificando tu cuenta...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró token de verificación.');
      return;
    }

    async function verify() {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setStatus('error');
        setMessage(payload.message || payload.error || 'Error al verificar la cuenta.');
      } else {
        setStatus('success');
        setMessage('Cuenta activada correctamente. Ya puedes iniciar sesión.');
      }
    }

    verify();
  }, [token]);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-sky-600 bg-white p-10 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Verificación de cuenta</h1>
          <p className="mt-4 text-slate-600">{message}</p>
          {status !== 'loading' ? (
            <div className="mt-8">
              <Link href="/login" className="rounded-full bg-sky-600 px-6 py-3 text-white hover:bg-sky-700">
                Ir a inicio de sesión
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
