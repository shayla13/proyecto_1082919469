import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EvalDoc — Evaluaciones Anónimas',
  description: 'EvalDoc permite a los estudiantes opinar sobre sus profesores con anonimato técnico y verificación institucional.',
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  authors: [{ name: 'Shayla Bueno' }],
  viewport: 'width=device-width, initial-scale=1.0',
  robots: 'index, follow',
  openGraph: {
    title: 'EvalDoc',
    description: 'Plataforma de evaluaciones anónimas de profesores.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-body bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
