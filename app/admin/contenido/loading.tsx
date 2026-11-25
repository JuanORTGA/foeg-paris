import React from 'react';

export default function AdminContenidoLoading() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl">
      {/* Header Skeleton */}
      <div className="pb-6 border-b border-foeg-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-36 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-9 w-64 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-32 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-10 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-3 border-b border-foeg-border/60 pb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
        ))}
      </div>

      {/* Content Form Blocks Skeleton */}
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-foeg-border/80 p-6 space-y-4 shadow-subtle">
            <div className="flex justify-between items-center pb-3 border-b border-foeg-border/40">
              <div className="h-4 w-44 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-full bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-10 w-full bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
