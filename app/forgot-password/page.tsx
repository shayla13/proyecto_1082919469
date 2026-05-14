'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
      setEmail('');
    } catch (err) {
      setMessage('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg
            className="w-12 h-12 text-blue-600 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7-2c1.32 0 2.58.66 3.3 1.65.67-.33 1.41-.65 2.2-.65 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-.87.29-1.68.78-2.35C18.8 12.85 18.41 12.43 18 12z" />
          </svg>
          <h1 className="text-3xl font-semibold text-gray-900">EvalDoc</h1>
          <p className="text-sm text-gray-500 mt-1">Recuperar contraseña</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl border-t-4 border-blue-600 shadow-lg p-8">
          <p className="text-gray-600 text-sm mb-6">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo institucional
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="tu@institucion.edu.co"
                required
              />
            </div>

            {/* Mensaje */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('exitoso') || message.includes('recibirás')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}
              >
                {message}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 block">
              Volver a ingresar
            </Link>
            <Link href="/register" className="text-sm text-blue-600 hover:text-blue-700 block">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </div>
      </div>
=======
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || payload.error || 'No se pudo enviar el correo.');
    } else {
      setMessage('Si el correo existe, se envió el enlace de recuperación.');
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
          <h1 className="text-3xl font-semibold text-slate-900">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-slate-600">Recibirás un enlace por correo para crear una nueva contraseña.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Correo institucional</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="usuario@institucion.edu.co"
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
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/login" className="text-sky-600 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </section>
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
    </main>
  );
}
