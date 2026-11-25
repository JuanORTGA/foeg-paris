/**
 * FOEG Paris — Règles de Livraison Internationales & Haute Couture
 */

export interface ShippingSettings {
  standardEuCost: number;
  freeShippingThreshold: number;
  expressIntlCost: number;
  pickupEnabled: boolean;
  pickupEstimate: string;
  euDeliveryEstimate: string;
  intlDeliveryEstimate: string;
  customsNoticeText: string;
  euDeliveryEstimate_fr?: string;
  euDeliveryEstimate_en?: string;
  euDeliveryEstimate_es?: string;
  intlDeliveryEstimate_fr?: string;
  intlDeliveryEstimate_en?: string;
  intlDeliveryEstimate_es?: string;
  customsNoticeText_fr?: string;
  customsNoticeText_en?: string;
  customsNoticeText_es?: string;
  pickupEstimate_fr?: string;
  pickupEstimate_en?: string;
  pickupEstimate_es?: string;
  countries?: ShippingCountry[];
}

export const DEFAULT_SHIPPING_TEXTS = {
  fr: {
    euDeliveryEstimate: '2 à 4 jours ouvrés (24-48h en France)',
    intlDeliveryEstimate: '3 à 5 jours ouvrés via DHL Express',
    customsNoticeText: 'Les droits de douane et taxes locales peuvent s’appliquer à la réception.',
    pickupEstimate: 'Disponible sous 2 heures à l’Atelier Paris',
  },
  en: {
    euDeliveryEstimate: '2 to 4 business days (24-48h in France)',
    intlDeliveryEstimate: '3 to 5 business days via DHL Express',
    customsNoticeText: 'Customs duties and local taxes may apply upon delivery.',
    pickupEstimate: 'Available within 2 hours at the Paris Atelier',
  },
  es: {
    euDeliveryEstimate: '2 a 4 días laborables (24-48h en Francia)',
    intlDeliveryEstimate: '3 a 5 días laborables vía DHL Express',
    customsNoticeText: 'Los aranceles de aduana e impuestos locales pueden aplicarse a la entrega.',
    pickupEstimate: 'Disponible en 2 horas en el Atelier de París',
  },
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  standardEuCost: 15,
  freeShippingThreshold: 150,
  expressIntlCost: 45,
  pickupEnabled: true,
  pickupEstimate: DEFAULT_SHIPPING_TEXTS.fr.pickupEstimate,
  euDeliveryEstimate: DEFAULT_SHIPPING_TEXTS.fr.euDeliveryEstimate,
  intlDeliveryEstimate: DEFAULT_SHIPPING_TEXTS.fr.intlDeliveryEstimate,
  customsNoticeText: DEFAULT_SHIPPING_TEXTS.fr.customsNoticeText,
  euDeliveryEstimate_fr: DEFAULT_SHIPPING_TEXTS.fr.euDeliveryEstimate,
  euDeliveryEstimate_en: DEFAULT_SHIPPING_TEXTS.en.euDeliveryEstimate,
  euDeliveryEstimate_es: DEFAULT_SHIPPING_TEXTS.es.euDeliveryEstimate,
  intlDeliveryEstimate_fr: DEFAULT_SHIPPING_TEXTS.fr.intlDeliveryEstimate,
  intlDeliveryEstimate_en: DEFAULT_SHIPPING_TEXTS.en.intlDeliveryEstimate,
  intlDeliveryEstimate_es: DEFAULT_SHIPPING_TEXTS.es.intlDeliveryEstimate,
  customsNoticeText_fr: DEFAULT_SHIPPING_TEXTS.fr.customsNoticeText,
  customsNoticeText_en: DEFAULT_SHIPPING_TEXTS.en.customsNoticeText,
  customsNoticeText_es: DEFAULT_SHIPPING_TEXTS.es.customsNoticeText,
  pickupEstimate_fr: DEFAULT_SHIPPING_TEXTS.fr.pickupEstimate,
  pickupEstimate_en: DEFAULT_SHIPPING_TEXTS.en.pickupEstimate,
  pickupEstimate_es: DEFAULT_SHIPPING_TEXTS.es.pickupEstimate,
};

export interface ShippingCountry {
  code: string;
  nameFr: string;
  nameEn: string;
  nameEs: string;
  isEu: boolean;
  enabled?: boolean;
}

export const SHIPPING_COUNTRIES: ShippingCountry[] = [
  // --- FRANCE & PRINCIPAUTÉ ---
  { code: 'FR', nameFr: 'France Métropolitaine', nameEn: 'France', nameEs: 'Francia', isEu: true, enabled: true },
  { code: 'MC', nameFr: 'Monaco', nameEn: 'Monaco', nameEs: 'Mónaco', isEu: true, enabled: true },

  // --- UNION EUROPÉENNE (COLISSIMO / CHRONOPOST SIGNATURE) ---
  { code: 'BE', nameFr: 'Belgique', nameEn: 'Belgium', nameEs: 'Bélgica', isEu: true, enabled: true },
  { code: 'LU', nameFr: 'Luxembourg', nameEn: 'Luxembourg', nameEs: 'Luxemburgo', isEu: true, enabled: true },
  { code: 'DE', nameFr: 'Allemagne', nameEn: 'Germany', nameEs: 'Alemania', isEu: true, enabled: true },
  { code: 'IT', nameFr: 'Italie', nameEn: 'Italy', nameEs: 'Italia', isEu: true, enabled: true },
  { code: 'ES', nameFr: 'Espagne', nameEn: 'Spain', nameEs: 'España', isEu: true, enabled: true },
  { code: 'NL', nameFr: 'Pays-Bas', nameEn: 'Netherlands', nameEs: 'Países Bajos', isEu: true, enabled: true },
  { code: 'PT', nameFr: 'Portugal', nameEn: 'Portugal', nameEs: 'Portugal', isEu: true, enabled: true },
  { code: 'AT', nameFr: 'Autriche', nameEn: 'Austria', nameEs: 'Austria', isEu: true, enabled: true },
  { code: 'IE', nameFr: 'Irlande', nameEn: 'Ireland', nameEs: 'Irlanda', isEu: true, enabled: true },
  { code: 'DK', nameFr: 'Danemark', nameEn: 'Denmark', nameEs: 'Dinamarca', isEu: true, enabled: true },
  { code: 'SE', nameFr: 'Suède', nameEn: 'Sweden', nameEs: 'Suecia', isEu: true, enabled: true },
  { code: 'FI', nameFr: 'Finlande', nameEn: 'Finland', nameEs: 'Finlandia', isEu: true, enabled: true },
  { code: 'EE', nameFr: 'Estonie', nameEn: 'Estonia', nameEs: 'Estonia', isEu: true, enabled: true },
  { code: 'LT', nameFr: 'Lituanie', nameEn: 'Lithuania', nameEs: 'Lituania', isEu: true, enabled: true },
  { code: 'LV', nameFr: 'Lettonie', nameEn: 'Latvia', nameEs: 'Letonia', isEu: true, enabled: true },
  { code: 'PL', nameFr: 'Pologne', nameEn: 'Poland', nameEs: 'Polonia', isEu: true, enabled: true },
  { code: 'CZ', nameFr: 'République Tchèque', nameEn: 'Czech Republic', nameEs: 'República Checa', isEu: true, enabled: true },
  { code: 'SK', nameFr: 'Slovaquie', nameEn: 'Slovakia', nameEs: 'Eslovaquia', isEu: true, enabled: true },
  { code: 'HU', nameFr: 'Hongrie', nameEn: 'Hungary', nameEs: 'Hungría', isEu: true, enabled: true },
  { code: 'RO', nameFr: 'Roumanie', nameEn: 'Romania', nameEs: 'Rumania', isEu: true, enabled: true },
  { code: 'BG', nameFr: 'Bulgarie', nameEn: 'Bulgaria', nameEs: 'Bulgaria', isEu: true, enabled: true },
  { code: 'GR', nameFr: 'Grèce', nameEn: 'Greece', nameEs: 'Grecia', isEu: true, enabled: true },
  { code: 'HR', nameFr: 'Croatie', nameEn: 'Croatia', nameEs: 'Croacia', isEu: true, enabled: true },
  { code: 'SI', nameFr: 'Slovénie', nameEn: 'Slovenia', nameEs: 'Eslovenia', isEu: true, enabled: true },
  { code: 'CY', nameFr: 'Chypre', nameEn: 'Cyprus', nameEs: 'Chipre', isEu: true, enabled: true },
  { code: 'MT', nameFr: 'Malte', nameEn: 'Malta', nameEs: 'Malta', isEu: true, enabled: true },

  // --- EUROPE HORS-UE & EFTA (DHL EXPRESS AIR) ---
  { code: 'CH', nameFr: 'Suisse', nameEn: 'Switzerland', nameEs: 'Suiza', isEu: false, enabled: true },
  { code: 'GB', nameFr: 'Royaume-Uni', nameEn: 'United Kingdom', nameEs: 'Reino Unido', isEu: false, enabled: true },
  { code: 'NO', nameFr: 'Norvège', nameEn: 'Norway', nameEs: 'Noruega', isEu: false, enabled: true },
  { code: 'IS', nameFr: 'Islande', nameEn: 'Iceland', nameEs: 'Islandia', isEu: false, enabled: true },
  { code: 'AD', nameFr: 'Andorre', nameEn: 'Andorra', nameEs: 'Andorra', isEu: false, enabled: true },

  // --- AMÉRIQUE DU NORD ---
  { code: 'US', nameFr: 'États-Unis', nameEn: 'United States', nameEs: 'Estados Unidos', isEu: false, enabled: true },
  { code: 'CA', nameFr: 'Canada', nameEn: 'Canada', nameEs: 'Canadá', isEu: false, enabled: true },
  { code: 'MX', nameFr: 'Mexique', nameEn: 'Mexico', nameEs: 'México', isEu: false, enabled: true },

  // --- AMÉRIQUE LATINE & CARAÏBES ---
  { code: 'VE', nameFr: 'Venezuela', nameEn: 'Venezuela', nameEs: 'Venezuela', isEu: false, enabled: true },
  { code: 'CO', nameFr: 'Colombie', nameEn: 'Colombia', nameEs: 'Colombia', isEu: false, enabled: true },
  { code: 'AR', nameFr: 'Argentine', nameEn: 'Argentina', nameEs: 'Argentina', isEu: false, enabled: true },
  { code: 'CL', nameFr: 'Chili', nameEn: 'Chile', nameEs: 'Chile', isEu: false, enabled: true },
  { code: 'BR', nameFr: 'Brésil', nameEn: 'Brazil', nameEs: 'Brasil', isEu: false, enabled: true },
  { code: 'PA', nameFr: 'Panama', nameEn: 'Panama', nameEs: 'Panamá', isEu: false, enabled: true },
  { code: 'PE', nameFr: 'Pérou', nameEn: 'Peru', nameEs: 'Perú', isEu: false, enabled: true },
  { code: 'CR', nameFr: 'Costa Rica', nameEn: 'Costa Rica', nameEs: 'Costa Rica', isEu: false, enabled: true },
  { code: 'UY', nameFr: 'Uruguay', nameEn: 'Uruguay', nameEs: 'Uruguay', isEu: false, enabled: true },
  { code: 'DO', nameFr: 'République Dominicaine', nameEn: 'Dominican Republic', nameEs: 'República Dominicana', isEu: false, enabled: true },

  // --- ASIE & OCÉANIE ---
  { code: 'JP', nameFr: 'Japon', nameEn: 'Japan', nameEs: 'Japón', isEu: false, enabled: true },
  { code: 'KR', nameFr: 'Corée du Sud', nameEn: 'South Korea', nameEs: 'Corea del Sur', isEu: false, enabled: true },
  { code: 'SG', nameFr: 'Singapour', nameEn: 'Singapore', nameEs: 'Singapur', isEu: false, enabled: true },
  { code: 'HK', nameFr: 'Hong Kong', nameEn: 'Hong Kong', nameEs: 'Hong Kong', isEu: false, enabled: true },
  { code: 'TW', nameFr: 'Taïwan', nameEn: 'Taiwan', nameEs: 'Taiwán', isEu: false, enabled: true },
  { code: 'AU', nameFr: 'Australie', nameEn: 'Australia', nameEs: 'Australia', isEu: false, enabled: true },
  { code: 'NZ', nameFr: 'Nouvelle-Zélande', nameEn: 'New Zealand', nameEs: 'Nueva Zelanda', isEu: false, enabled: true },

  // --- MOYEN-ORIENT ---
  { code: 'AE', nameFr: 'Émirats Arabes Unis', nameEn: 'United Arab Emirates', nameEs: 'Emiratos Árabes', isEu: false, enabled: true },
  { code: 'SA', nameFr: 'Arabie Saoudite', nameEn: 'Saudi Arabia', nameEs: 'Arabia Saudita', isEu: false, enabled: true },
  { code: 'QA', nameFr: 'Qatar', nameEn: 'Qatar', nameEs: 'Catar', isEu: false, enabled: true },
  { code: 'KW', nameFr: 'Koweït', nameEn: 'Kuwait', nameEs: 'Kuwait', isEu: false, enabled: true },
  { code: 'IL', nameFr: 'Israël', nameEn: 'Israel', nameEs: 'Israel', isEu: false, enabled: true },

  // --- RESTE DU MONDE ---
  { code: 'WORLD', nameFr: 'Reste du Monde (International)', nameEn: 'Rest of World', nameEs: 'Resto del Mundo', isEu: false, enabled: true },
];

export interface ShippingCalculation {
  carrier: string;
  serviceName: string;
  estimatedDelivery: string;
  cost: number;
  isFree: boolean;
  isNonEu: boolean;
  customsNotice: string | null;
}

/**
 * Calcule les frais et délais d'expédition selon le pays, le sous-total et les paramètres configurés
 */
export function calculateShipping(
  countryCode: string,
  subtotalEur: number,
  isPickup: boolean = false,
  settings: ShippingSettings = DEFAULT_SHIPPING_SETTINGS,
  lang: string = 'fr'
): ShippingCalculation {
  const activeLang = lang === 'es' ? 'es' : lang === 'en' ? 'en' : 'fr';
  const defaultTexts = DEFAULT_SHIPPING_TEXTS[activeLang];

  if (isPickup) {
    const carrier =
      activeLang === 'es' ? 'Retiro en Boutique' : activeLang === 'en' ? 'Store Pickup' : 'Retrait en Boutique';
    const serviceName =
      activeLang === 'es'
        ? 'Retiro en el Atelier FOEG París'
        : activeLang === 'en'
        ? 'Pickup at FOEG Paris Atelier'
        : 'Retrait à l’Atelier FOEG Paris';
    const estimatedDelivery =
      (settings as any)[`pickupEstimate_${activeLang}`] ||
      settings.pickupEstimate ||
      defaultTexts.pickupEstimate;

    return {
      carrier,
      serviceName,
      estimatedDelivery,
      cost: 0,
      isFree: true,
      isNonEu: false,
      customsNotice: null,
    };
  }

  const countryList =
    settings.countries && settings.countries.length > 0
      ? settings.countries
      : SHIPPING_COUNTRIES;
  const country =
    countryList.find((c) => c.code === countryCode) || countryList[0];
  const isEu = country.isEu;

  if (isEu) {
    const isFree = subtotalEur >= settings.freeShippingThreshold;
    const cost = isFree ? 0 : settings.standardEuCost;
    const estimatedDelivery =
      countryCode === 'FR'
        ? activeLang === 'es'
          ? '24 a 48h hábiles en Francia'
          : activeLang === 'en'
          ? '24 to 48 business hours in France'
          : '24 à 48h ouvrées en France'
        : (settings as any)[`euDeliveryEstimate_${activeLang}`] ||
          settings.euDeliveryEstimate ||
          defaultTexts.euDeliveryEstimate;

    const carrier = 'Colissimo / Chronopost Privé';
    const serviceName =
      activeLang === 'es'
        ? 'Envío Estándar con Firma'
        : activeLang === 'en'
        ? 'Standard Signature Delivery'
        : 'Livraison Standard Signature';

    return {
      carrier,
      serviceName,
      estimatedDelivery,
      cost,
      isFree,
      isNonEu: false,
      customsNotice: null,
    };
  } else {
    // Non-EU / International (USA, Canada, Latam, Asie, etc.)
    const cost = settings.expressIntlCost;
    const estimatedDelivery =
      countryCode === 'CH' || countryCode === 'GB'
        ? activeLang === 'es'
          ? '3 a 4 días laborables'
          : activeLang === 'en'
          ? '3 to 4 business days'
          : '3 à 4 jours ouvrés'
        : (settings as any)[`intlDeliveryEstimate_${activeLang}`] ||
          settings.intlDeliveryEstimate ||
          defaultTexts.intlDeliveryEstimate;

    const customsNotice =
      (settings as any)[`customsNoticeText_${activeLang}`] ||
      settings.customsNoticeText ||
      defaultTexts.customsNoticeText;

    const carrier = 'DHL Express Worldwide';
    const serviceName =
      activeLang === 'es'
        ? 'Envío Prioritario Internacional DHL Express'
        : activeLang === 'en'
        ? 'International Priority Delivery DHL Express'
        : 'Livraison Prioritaire Internationale DHL Express';

    return {
      carrier,
      serviceName,
      estimatedDelivery,
      cost,
      isFree: false,
      isNonEu: true,
      customsNotice,
    };
  }
}
