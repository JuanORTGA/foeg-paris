'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-foeg-border border-y border-foeg-border', className)}>
      {items.map(item => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="py-4">
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between text-left group focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-xs uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy transition-colors font-medium">
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-foeg-muted transition-transform duration-300 ease-out',
                  isOpen && 'transform rotate-180'
                )}
                strokeWidth={1}
              />
            </button>
            {isOpen && (
              <div className="pt-4 pb-2 text-xs text-foeg-muted font-light leading-relaxed animate-fadeIn">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
