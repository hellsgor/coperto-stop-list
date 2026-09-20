import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';
import type { SelectHTMLAttributes } from 'react';

type Option = {
  value: string;
  label: string;
};

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly Option[];
  error?: string;
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, options, error, placeholder, id, className, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-foreground text-sm font-medium">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          'focus-visible:ring-accent cursor-pointer rounded-md border border-black/10 px-3 py-1.5 text-sm hover:border-black/20 focus-visible:ring-2 focus-visible:outline-none',
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-accent text-xs">
          {error}
        </p>
      )}
    </div>
  );
});
