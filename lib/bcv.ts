/**
 * FOEG Paris — Service de Conversion Monétaire Officielle BCV (Venezuela)
 * Récupère le taux de change officiel du Banco Central de Venezuela (BCV).
 */

const FALLBACK_BCV_RATE = 62.50; // Taux de repli sécurisé

export interface BcvApiResponse {
  datetime?: { date: string; time: string };
  monitors?: {
    bcv?: {
      price: number;
      last_update?: string;
    };
  };
  price?: number;
}

/**
 * Récupère le taux officiel du Dollar / Euro BCV depuis l'API publique
 */
export async function getBcvRate(): Promise<number> {
  try {
    const res = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv', {
      next: { revalidate: 3600 }, // Cache d'une heure
      signal: AbortSignal.timeout(3000), // Timeout rapide pour ne jamais bloquer l'UI
    });

    if (!res.ok) {
      return FALLBACK_BCV_RATE;
    }

    const data: BcvApiResponse = await res.json();
    const rate = data.monitors?.bcv?.price || data.price;
    if (typeof rate === 'number' && rate > 0) {
      return Number(rate.toFixed(2));
    }
    return FALLBACK_BCV_RATE;
  } catch (error) {
    // Si pas d'accès réseau ou hors-ligne, on utilise le taux de référence
    return FALLBACK_BCV_RATE;
  }
}

/**
 * Convertit un montant EUR/USD en Bolívares (VES) au taux BCV
 */
export function calculateVesAmount(amountEurOrUsd: number, bcvRate: number = FALLBACK_BCV_RATE): number {
  return Number((amountEurOrUsd * bcvRate).toFixed(2));
}

/**
 * Formate un montant en Bolívares (VES) selon les standards bancaires vénézuéliens
 * Ex: Bs. 1.850.000,00
 */
export function formatVesPrice(amountInVes: number): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInVes);

  return `Bs. ${formatted}`;
}
