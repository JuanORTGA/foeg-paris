import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] uppercase tracking-[0.2em] text-foeg-black/80 font-medium"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'w-full bg-transparent border-b border-foeg-black/30 focus:border-foeg-navy py-2.5 text-xs text-foeg-black placeholder:text-foeg-muted/60 focus:outline-none transition-colors duration-200 font-light rounded-none',
            error && 'border-red-800 text-red-900',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[10px] text-red-800 font-light tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
