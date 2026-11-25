import React from 'react';

export default function ContentLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-24 space-y-12 animate-fadeIn font-sans">
      {/* Encabezado Editorial Minimalista Skeleton */}
      <div className="space-y-4 max-w-2xl">
        <div className="h-3 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-9 sm:h-12 w-3/4 max-w-md bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-4 w-full max-w-lg bg-[#EBE7DF] animate-pulse rounded-none pt-1" />
      </div>

      {/* Banner / Gran Formato Skeleton (Elegancia Silenciosa) */}
      <div className="aspect-[16/7] md:aspect-[21/9] w-full bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/40" />

      {/* Grilla Editorial / Artículos / Secciones Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/3] w-full bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/30" />
            <div className="space-y-2 pt-1">
              <div className="h-3 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-5 w-4/5 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3.5 w-full bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3.5 w-2/3 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
