'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no válido');
      setLoading(false);
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
      return;
    }

    async function verify() {
<<<<<<< HEAD
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al verificar');
          setLoading(false);
          return;
        }

        setMessage(data.message);
        setVerified(true);
        setLoading(false);

        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        setError('Error de conexión');
        setLoading(false);
        console.error(err);
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
      }
    }

    verify();
<<<<<<< HEAD
  }, [token, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <svg
          className="w-16 h-16 text-blue-600 mx-auto mb-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7-2c1.32 0 2.58.66 3.3 1.65.67-.33 1.41-.65 2.2-.65 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-.87.29-1.68.78-2.35C18.8 12.85 18.41 12.43 18 12z" />
        </svg>

        {loading && (
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Verificando tu correo...</h1>
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Error en la verificación</h1>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
              {error}
            </div>
            <Link
              href="/register"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Volver al registro
            </Link>
          </div>
        )}

        {verified && !loading && (
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">¡Verificado!</h1>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-6">
              {message}
            </div>
            <p className="text-gray-600 mb-4">Redirigiendo al login...</p>
          </div>
        )}
      </div>
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    </main>
  );
}
