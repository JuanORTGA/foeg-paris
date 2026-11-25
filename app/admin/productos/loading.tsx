import React from 'react';

export default function AdminProductosLoading() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl">
      {/* Header Skeleton */}
      <div className="pb-6 border-b border-foeg-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-9 w-64 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="h-11 w-44 bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Barra de Búsqueda y Filtros Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="h-10 w-full sm:w-80 bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="flex space-x-3">
          <div className="h-10 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-10 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
      </div>

      {/* Tabla de Productos Skeleton */}
      <div className="bg-white border border-foeg-border/80 shadow-subtle overflow-hidden">
        <div className="divide-y divide-foeg-border/60">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-16 bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/50 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-[#EBE7DF] animate-pulse rounded-none" />
                  <div className="h-3 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
                </div>
              </div>
              <div className="hidden sm:block h-3.5 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-6 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-[#EBE7DF] animate-pulse rounded-none" />
                <div className="w-8 h-8 bg-[#EBE7DF] animate-pulse rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
