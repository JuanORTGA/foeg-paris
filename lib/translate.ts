/**
 * FOEG Paris — Moteur de Traduction Automatique Haute Couture
 * Supporte l'API Google Translate avec fallback de résilience interne
 * pour garantir que jamais un champ ne reste vide ou ne plante en CMS.
 */

// Dictionnaire de secours haute couture pour termes fréquents si l'API externe est injoignable
const EDITORIAL_FALLBACKS: Record<string, { en: string; es: string }> = {
  // Navigation & Identité
  'Atelier': { en: 'Atelier', es: 'Atelier' },
  'Maison': { en: 'Maison', es: 'Maison' },
  'Maison FOEG': { en: 'Maison FOEG', es: 'Maison FOEG' },
  'Boutique': { en: 'Boutique', es: 'Boutique' },
  'Collections': { en: 'Collections', es: 'Colecciones' },
  'Femme': { en: 'Women', es: 'Mujer' },
  'Homme': { en: 'Men', es: 'Hombre' },
  'Journal': { en: 'Journal', es: 'Journal' },
  'Savoir-Faire': { en: 'Craftsmanship', es: 'Saber Hacer' },
  'Matières Nobles': { en: 'Noble Materials', es: 'Materias Nobles' },
  'Luxe Silencieux': { en: 'Silent Luxury', es: 'Lujo Silencioso' },
  
  // Matières
  'Soie': { en: 'Silk', es: 'Seda' },
  'Cachemire': { en: 'Cashmere', es: 'Cachemira' },
  'Laine Vierge': { en: 'Virgin Wool', es: 'Lana Virgen' },
  'Coton Égyptien': { en: 'Egyptian Cotton', es: 'Algodón Egipcio' },
};

export async function autoTranslate(
  text: string,
  targetLang: 'fr' | 'en' | 'es',
  sourceLang: string = 'auto'
): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  // Ne pas traduire les URLs, identifiants ou chemins médias
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('res.cloudinary.com') ||
    trimmed.startsWith('foeg-')
  ) {
    return trimmed;
  }

  // 1. Vérification dans le dictionnaire interne rapide
  if (EDITORIAL_FALLBACKS[trimmed]) {
    if (targetLang === 'es') return EDITORIAL_FALLBACKS[trimmed].es;
    if (targetLang === 'en') return EDITORIAL_FALLBACKS[trimmed].en;
    if (targetLang === 'fr') return trimmed;
  }

  // 2. Appel avec API Key officielle si configurée dans .env
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.TRANSLATE_API_KEY;
  if (apiKey && apiKey.length > 10) {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: trimmed,
          target: targetLang,
          source: sourceLang === 'auto' ? undefined : sourceLang,
          format: 'text',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const translatedText = data?.data?.translations?.[0]?.translatedText;
        if (translatedText) return translatedText;
      }
    } catch (err) {
      console.warn(`[OFFICIAL TRANSLATE API NOTE]:`, err);
    }
  }

  // 3. Appel au point de terminaison client gratuit (Client GTX) avec timeout strict
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((segment: any) => (Array.isArray(segment) ? segment[0] : ''))
          .filter(Boolean)
          .join('');

        if (translated) return translated;
      }
    }
  } catch (err) {
    // Échec réseau gracieux : repli au texte source garanti
  }

  // 4. Fallback de sécurité garanti (ne jamais retourner vide)
  return trimmed;
}

export const translateText = autoTranslate;

export async function smartTranslateAll(
  text: string,
  sourceLang: 'fr' | 'en' | 'es' = 'fr'
): Promise<{ fr: string; en: string; es: string }> {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { fr: '', en: '', es: '' };
  }

  const [fr, en, es] = await Promise.all([
    sourceLang === 'fr' ? Promise.resolve(trimmed) : autoTranslate(trimmed, 'fr', sourceLang),
    sourceLang === 'en' ? Promise.resolve(trimmed) : autoTranslate(trimmed, 'en', sourceLang),
    sourceLang === 'es' ? Promise.resolve(trimmed) : autoTranslate(trimmed, 'es', sourceLang),
  ]);

  return {
    fr: fr || trimmed,
    en: en || trimmed,
    es: es || trimmed,
  };
}

export async function translateFromFrench(
  textFr: string
): Promise<{ en: string; es: string }> {
  const { en, es } = await smartTranslateAll(textFr, 'fr');
  return { en, es };
}
