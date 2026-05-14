import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
}

export function Toast({ title, description, variant = 'default', className }: ToastProps) {
  const variants = {
    default: 'bg-background border',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm rounded-lg p-4 shadow-lg',
        variants[variant],
        className
      )}
    >
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm mt-1">{description}</div>}
    </div>
  );
}