import React from 'react';

export default function AdminPedidosLoading() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl">
      {/* Header Skeleton */}
      <div className="pb-6 border-b border-foeg-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-9 w-64 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="h-10 w-36 bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Pestañas de Filtro y Buscador Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-28 bg-[#EBE7DF] animate-pulse rounded-none shrink-0" />
          ))}
        </div>
        <div className="h-10 w-full sm:w-72 bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Tabla de Pedidos Skeleton */}
      <div className="bg-white border border-foeg-border/80 shadow-subtle overflow-hidden">
        <div className="divide-y divide-foeg-border/60">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="space-y-1.5 w-32">
                <div className="h-4 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
                <div className="h-2.5 w-16 bg-[#EBE7DF] animate-pulse rounded-none" />
              </div>
              <div className="space-y-1.5 flex-1 max-w-xs">
                <div className="h-4 w-36 bg-[#EBE7DF] animate-pulse rounded-none" />
                <div className="h-2.5 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
              </div>
              <div className="hidden sm:block h-3.5 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-7 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="w-8 h-8 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
