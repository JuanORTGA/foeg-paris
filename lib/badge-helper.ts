export interface BadgeConfig {
  label: string;
  className: string;
}

export function getProductBadge(
  product: { badge?: string | null; isNew?: boolean },
  t?: (key: string) => string
): BadgeConfig | null {
  const badge = product.badge;

  // Si explícitamente se configuró "NONE", no mostrar nada
  if (badge === 'NONE') {
    return null;
  }

  if (badge === 'LIMITED') {
    return {
      label: t ? t('products.limited') : 'Édition Limitée',
      className: 'bg-foeg-navy text-foeg-white border border-white/20',
    };
  }

  if (badge === 'SALE') {
    return {
      label: t ? (t('products.sale') || 'Offre Spéciale') : 'Offre Spéciale',
      className: 'bg-[#581825] text-white border border-red-900/30',
    };
  }

  if (badge === 'NEW') {
    return {
      label: t ? (t('products.new') || 'Nouveauté') : 'Nouveauté',
      className: 'bg-foeg-white/95 text-foeg-navy border border-foeg-border/80 shadow-2xs',
    };
  }

  if (badge === 'EXCLUSIVE') {
    return {
      label: t ? (t('products.exclusive') || 'Exclusivité Atelier') : 'Exclusivité Atelier',
      className: 'bg-[#18181B] text-[#D4AF37] border border-[#D4AF37]/40',
    };
  }

  if (badge === 'UNIQUE') {
    return {
      label: t ? (t('products.unique') || 'Pièce Unique') : 'Pièce Unique',
      className: 'bg-[#2D2A26] text-[#E8E5DF] border border-stone-600',
    };
  }

  // Texto personalizado si viene un valor libre no vacío
  if (badge && typeof badge === 'string' && badge.trim().length > 0) {
    return {
      label: badge.trim(),
      className: 'bg-foeg-navy text-foeg-white border border-white/20',
    };
  }

  // Fallback para productos nuevos antiguos sin badge explícito
  if (product.isNew && (badge === undefined || badge === null)) {
    return {
      label: t ? (t('products.new') || 'Nouveau') : 'Nouveau',
      className: 'bg-foeg-white/90 backdrop-blur-xs text-foeg-navy border border-foeg-border/60',
    };
  }

  return null;
}
