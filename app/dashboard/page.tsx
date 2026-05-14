'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Bienvenido, {user?.name}
        </h1>

        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 mb-4">Dashboard de Fase 1 - Placeholder</p>
          <p className="text-gray-700">
            Email: {user?.email}
          </p>
          <p className="text-gray-700">
            Rol: {user?.role}
          </p>
        </div>
      </div>
    </main>
  );
}
