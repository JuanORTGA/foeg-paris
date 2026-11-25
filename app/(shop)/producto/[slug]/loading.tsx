import React from 'react';

export default function ProductoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-32 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Columna Izquierda: Galería de Imágenes Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/40" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/30" />
            ))}
          </div>
        </div>

        {/* Columna Derecha: Información Editorial Skeleton */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 h-fit">
          <div className="space-y-3 pb-6 border-b border-foeg-border/60">
            <div className="h-3 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
            <div className="h-10 sm:h-12 w-4/5 bg-[#EBE7DF] animate-pulse rounded-none" />
            <div className="h-6 w-32 bg-[#EBE7DF] animate-pulse rounded-none pt-1" />
          </div>

          {/* Selector de Tallas Skeleton */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-[#EBE7DF] animate-pulse rounded-none" />
              <div className="h-3 w-28 bg-[#EBE7DF] animate-pulse rounded-none" />
            </div>
            <div className="flex items-center space-x-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-11 w-14 bg-[#EBE7DF] animate-pulse rounded-none border border-foeg-border/50" />
              ))}
            </div>
          </div>

          {/* Botón CTA Añadir a la Bolsa Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-14 w-full bg-[#EBE7DF] animate-pulse rounded-none" />
            <div className="h-3 w-48 mx-auto bg-[#EBE7DF] animate-pulse rounded-none" />
          </div>

          {/* Acordeones Editoriales Skeleton */}
          <div className="space-y-4 pt-6 border-t border-foeg-border/60">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="py-4 border-b border-foeg-border/40 flex justify-between items-center">
                <div className="h-4 w-40 bg-[#EBE7DF] animate-pulse rounded-none" />
                <div className="h-3 w-3 bg-[#EBE7DF] animate-pulse rounded-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
