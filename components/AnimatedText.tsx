'use client';

import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function AnimatedText({
  text,
  delay = 0,
  className = '',
}: AnimatedTextProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={`transition-all duration-1000 ease-out inline-block ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {text.split('').map((char, index) => (
        <span
          key={`${index}-${char}`}
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity 0.05s ease-out ${index * 30}ms`,
            display: 'inline-block',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
