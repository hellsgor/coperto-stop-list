import { cn } from '@/shared/lib/cn';
import { Spinner } from './Spinner';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  children?: ReactNode;
};

const VARIANT_CLASSES: Record<'primary' | 'secondary', string> = {
  primary:
    'bg-accent text-white not-disabled:hover:bg-accent/90 not-disabled:active:bg-accent/80',
  secondary:
    'border border-black/10 text-foreground not-disabled:hover:bg-black/5 not-disabled:active:bg-black/10',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      {...rest}
      disabled={Boolean(disabled) || isLoading}
      aria-busy={isLoading}
      className={cn(
        'focus-visible:ring-accent focus-visible:ring-offset-background inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
