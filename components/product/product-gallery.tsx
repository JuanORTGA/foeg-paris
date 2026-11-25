import React from 'react';

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-foeg-surface flex items-center justify-center border border-foeg-border/40">
        <span className="text-[11px] uppercase tracking-[0.25em] text-foeg-muted">
          {productName}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {images.map((image, idx) => (
        <div
          key={idx}
          className="aspect-[3/4] bg-foeg-surface relative overflow-hidden border border-foeg-border/30"
        >
          {/* Layout editorial limpio: sin sombras ni bordes redondeados excesivos */}
          <div className="w-full h-full flex items-center justify-center text-foeg-muted text-[10px] uppercase tracking-widest font-light">
            {image.alt || `${productName} — Vue ${idx + 1}`}
          </div>
        </div>
      ))}
    </div>
  );
}
