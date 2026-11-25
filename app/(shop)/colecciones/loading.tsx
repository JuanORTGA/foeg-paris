import React from 'react';

export default function ColeccionesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-32 space-y-14 animate-fadeIn">
      {/* Cabecera Editorial Skeleton */}
      <div className="pb-8 border-b border-foeg-border/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-3 w-40 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-12 w-64 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="h-4 w-72 max-w-full bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Grid de Colecciones Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-14">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[3/4] w-full bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/40" />
            <div className="space-y-2 pt-1">
              <div className="h-4 w-3/4 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3 w-1/2 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3.5 w-24 bg-[#EBE7DF] animate-pulse rounded-none pt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
