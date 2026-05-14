import type { Metadata } from 'next';
<<<<<<< HEAD
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
=======
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Mi App TS | Home',
  description: 'Hola Mundo — Fullstack TypeScript + Next.js + Vercel',
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  authors: [{ name: 'Mi App' }],
  viewport: 'width=device-width, initial-scale=1.0',
  robots: 'index, follow',
  openGraph: {
    title: 'Mi App TS',
    description: 'Fullstack TypeScript Application',
=======
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
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
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
<<<<<<< HEAD
    <html lang="es" className={`${playfairDisplay.variable} ${lato.variable}`}>
      <body className="font-body">
=======
    <html lang="es" className={inter.variable}>
      <body className="font-body bg-white text-slate-900">
>>>>>>> 1907d1cb95630356fd0811f087de7928e0f7a901
        {children}
      </body>
    </html>
  );
}
