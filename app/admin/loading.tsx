import React from 'react';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl">
      {/* Header Skeleton */}
      <div className="pb-6 border-b border-foeg-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-9 w-60 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-10 w-36 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
      </div>

      {/* 4 Cartas de Métricas Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-foeg-border/80 p-6 space-y-4 shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="w-8 h-8 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
            <div className="h-8 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
            <div className="h-2.5 w-40 bg-[#EBE7DF] animate-pulse rounded-none" />
          </div>
        ))}
      </div>

      {/* Tabla de Actividad Reciente Skeleton */}
      <div className="bg-white border border-foeg-border/80 p-6 sm:p-8 space-y-6 shadow-subtle">
        <div className="flex items-center justify-between border-b border-foeg-border/60 pb-4">
          <div className="h-5 w-48 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-4 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-foeg-border/40 last:border-none">
              <div className="flex items-center space-x-4">
                <div className="w-9 h-9 bg-[#EBE7DF] animate-pulse rounded-none" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-[#EBE7DF] animate-pulse rounded-none" />
                  <div className="h-2.5 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
                </div>
              </div>
              <div className="h-4 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-6 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
