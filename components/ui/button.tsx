import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center uppercase tracking-[0.18em] transition-all duration-300 font-light disabled:opacity-50 disabled:pointer-events-none rounded-[2px]',
          {
            'bg-foeg-black text-foeg-white hover:bg-foeg-navy': variant === 'primary',
            'bg-foeg-navy text-foeg-white hover:bg-foeg-black': variant === 'secondary',
            'border border-foeg-black text-foeg-black hover:bg-foeg-black hover:text-foeg-white': variant === 'outline',
            'text-foeg-black hover:text-foeg-navy': variant === 'ghost',
            'text-[10px] px-4 py-2': size === 'sm',
            'text-[11px] px-6 py-3': size === 'md',
            'text-xs px-8 py-4': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
