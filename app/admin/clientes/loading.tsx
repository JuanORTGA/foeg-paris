import React from 'react';

export default function AdminClientesLoading() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl">
      {/* Header Skeleton */}
      <div className="pb-6 border-b border-foeg-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-9 w-56 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="h-10 w-44 bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>

      {/* Tabla Clientes Skeleton */}
      <div className="bg-white border border-foeg-border/80 p-6 sm:p-8 space-y-4 shadow-subtle">
        <div className="flex justify-between items-center pb-4 border-b border-foeg-border/60">
          <div className="h-4 w-40 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-8 w-48 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="divide-y divide-foeg-border/40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#EBE7DF] animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-[#EBE7DF] animate-pulse rounded-none" />
                  <div className="h-2.5 w-48 bg-[#EBE7DF] animate-pulse rounded-none" />
                </div>
              </div>
              <div className="h-3.5 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3.5 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-6 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
