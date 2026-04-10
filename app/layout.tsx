import type { Metadata } from 'next';
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
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
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
    <html lang="es" className={`${playfairDisplay.variable} ${lato.variable}`}>
      <body className="font-body">
        {children}
      </body>
    </html>
  );
}
