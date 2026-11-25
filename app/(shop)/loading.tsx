import React from 'react';

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20 space-y-12 animate-fadeIn">
      {/* Encabezado Editorial Skeleton */}
      <div className="space-y-4 max-w-xl">
        <div className="h-3 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-10 sm:h-12 w-64 bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-4 w-96 max-w-full bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Barra de Filtros Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foeg-border/60 pb-4">
        <div className="flex items-center space-x-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
          ))}
        </div>
        <div className="h-7 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Grilla de Productos Skeleton (Aspecto 3:4 The Row) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] w-full bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/40" />
            <div className="space-y-1.5 pt-1">
              <div className="h-4 w-3/4 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3 w-1/2 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3.5 w-20 bg-[#EBE7DF] animate-pulse rounded-none pt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
