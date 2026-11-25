import React from 'react';

export default function JournalArticleLoading() {
  return (
    <article className="max-w-4xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-28 space-y-10 animate-fadeIn font-sans">
      {/* Botón Volver Skeleton */}
      <div className="h-4 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />

      {/* Meta y Título Editorial Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-20 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-3 w-3 bg-[#EBE7DF] animate-pulse rounded-none" />
          <div className="h-3 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
        </div>
        <div className="h-10 sm:h-14 w-full max-w-2xl bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-5 w-4/5 bg-[#EBE7DF] animate-pulse rounded-none pt-2" />
      </div>

      {/* Imagen Principal de Crónica Skeleton */}
      <div className="aspect-[16/9] w-full bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/40" />

      {/* Cuerpo del Artículo Skeleton */}
      <div className="space-y-4 max-w-2xl pt-6">
        <div className="h-4 w-full bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-4 w-full bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-4 w-5/6 bg-[#EBE7DF] animate-pulse rounded-none" />
        <div className="h-4 w-4/5 bg-[#EBE7DF] animate-pulse rounded-none" />
      </div>
    </article>
  );
}
