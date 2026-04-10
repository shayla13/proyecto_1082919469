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
    <div
      className={`transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity 0.05s ease-out ${index * 30}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
