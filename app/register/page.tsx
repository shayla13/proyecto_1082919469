'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [allowedDomain, setAllowedDomain] = useState('');

  // Obtener dominio permitido
  useEffect(() => {
    async function getDomain() {
      try {
        const response = await fetch('/api/system/mode');
        // Solo get system config si está en live, sino usar dominio del seed
        const configRes = await fetch('/api/system/diagnose');
        const diag = await configRes.json();
        const configCheck = diag.checks.find((c: any) => c.name === 'system_config');
        if (configCheck?.value?.allowed_domain) {
          setAllowedDomain(configCheck.value.allowed_domain);
        } else {
          setAllowedDomain('evaldoc.edu.co');
        }
      } catch (err) {
        setAllowedDomain('evaldoc.edu.co');
      }
    }
    getDomain();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en el registro');
        return;
      }

      setSuccess(data.message);
      // Limpiar formulario
      setName('');
      setEmail('');
      setPassword('');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <svg
            className="w-12 h-12 text-blue-600 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7-2c1.32 0 2.58.66 3.3 1.65.67-.33 1.41-.65 2.2-.65 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-.87.29-1.68.78-2.35C18.8 12.85 18.41 12.43 18 12z" />
          </svg>
          <h1 className="text-3xl font-semibold text-gray-900">EvalDoc</h1>
          <p className="text-sm text-gray-500 mt-1">Crea tu cuenta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl border-t-4 border-blue-600 shadow-lg p-8">
          {/* Aviso de dominio */}
          {allowedDomain && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Usa tu correo institucional:</strong> @{allowedDomain}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="Tu nombre"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo institucional
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder={`tu@${allowedDomain || 'institucion.edu.co'}`}
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Link a login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
