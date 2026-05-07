'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allowedDomain, setAllowedDomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/system/config');
        const data = await response.json();
        setAllowedDomain(data.allowed_domain || data.allowedDomain || null);
      } catch {
        setAllowedDomain(null);
      }
    }
    fetchConfig();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.message || payload.error || 'No fue posible crear la cuenta.');
    } else {
      setMessage('Registro exitoso. Revisa tu correo para activar la cuenta.');
      setName('');
      setEmail('');
      setPassword('');
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
          <h1 className="text-3xl font-semibold text-slate-900">Registro</h1>
          <p className="mt-2 text-sm text-slate-600">
            Usa un correo institucional para mantener la confianza en el proceso.
          </p>
          {allowedDomain ? (
            <p className="mt-2 text-sm text-slate-500">
              Dominio permitido: <strong>{allowedDomain}</strong>
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nombre completo</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Tu nombre"
              required
            />
          </label>
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
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-sky-600 hover:underline">
            Inicia sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
