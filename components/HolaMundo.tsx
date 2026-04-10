'use client';

import AnimatedText from './AnimatedText';

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description?: string;
}

export default function HolaMundo({
  title,
  subtitle,
  description,
}: HolaMundoProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-white">
      <div className="text-center max-w-2xl px-4">
        {/* Línea decorativa superior */}
        <div className="mb-8 flex justify-center">
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        </div>

        {/* Título animado */}
        <h1 className="hero-headline shimmer-text mb-6">
          <AnimatedText text={title} delay={100} />
        </h1>

        {/* Subtítulo animado */}
        <p className="hero-subtext opacity-0 animate-fade-in">
          <AnimatedText text={subtitle} delay={500} />
        </p>

        {/* Descripción opcional */}
        {description && (
          <p className="mt-6 text-sm opacity-50 max-w-sm mx-auto opacity-0 animate-fade-in">
            <AnimatedText text={description} delay={700} />
          </p>
        )}

        {/* Línea decorativa inferior */}
        <div className="mt-12 flex justify-center">
          <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
