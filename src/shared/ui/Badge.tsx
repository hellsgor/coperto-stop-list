import { cn } from '@/shared/lib/cn';
import type { ReactNode } from 'react';

type Props = {
  variant?: 'neutral' | 'accent' | 'warning';
  children: ReactNode;
  className?: string;
};

const VARIANT_CLASSES: Record<'neutral' | 'accent' | 'warning', string> = {
  neutral: 'bg-black/5 text-foreground',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-amber-100 text-amber-800',
};

export function Badge({ variant = 'neutral', children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
