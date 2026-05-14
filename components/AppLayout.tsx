'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SeedModeBanner } from './SeedModeBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'student' | 'admin';
}

const studentNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/evaluate', label: 'Evaluar Profesores', icon: '📝' },
  { href: '/ranking', label: 'Ranking', icon: '📊' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
];

const adminNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/admin/professors', label: 'Profesores', icon: '👨‍🏫' },
  { href: '/admin/periods', label: 'Períodos', icon: '📅' },
  { href: '/admin/reports', label: 'Reportes', icon: '📈' },
  { href: '/admin/comments', label: 'Comentarios', icon: '💬' },
  { href: '/admin/config', label: 'Configuración', icon: '⚙️' },
  { href: '/admin/users', label: 'Usuarios', icon: '👥' },
  { href: '/admin/audit', label: 'Auditoría', icon: '🔍' },
  { href: '/admin/db-setup', label: 'Administración del Sistema', icon: '🛠️' },
];

export function AppLayout({ children, userRole = 'student' }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = userRole === 'admin' ? adminNavItems : studentNavItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <SeedModeBanner />

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">EvalDoc</span>
            </div>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors',
                pathname === item.href
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="truncate max-w-16">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pb-16 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}