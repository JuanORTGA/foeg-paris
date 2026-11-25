export interface ProductVariant {
  size: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | '26' | '28' | '30' | '32' | '34' | '36' | string
  stock: number;
  color: string;
  colorHex?: string;
}

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category: 'Mujer' | 'Hombre';
  subcategory?: 'Manteaux' | 'Chemises' | 'Pantalons' | 'Robes' | 'Chaussures' | 'Accessoires' | string;
  badge?: 'LIMITED' | 'SALE' | 'NEW' | 'EXCLUSIVE' | 'UNIQUE' | 'NONE' | string | null;
  images: string[]; // URLs de Unsplash en alta definición (tonos neutros / blanco y negro)
  isNew: boolean;
  composition: string;
  origin: string;
  care: string[];
  variants: ProductVariant[];
  measurements: {
    size: string;
    chest?: string;
    waist?: string;
    hips?: string;
    length?: string;
    inseam?: string;
  }[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'foeg-001',
    slug: 'le-manteau-en-cachemire',
    name: 'Le Manteau en Cachemire',
    price: 1850.0,
    currency: '€',
    category: 'Mujer',
    subcategory: 'Manteaux',
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Chef-d’œuvre d’architecture vestimentaire taillé dans un drap lourd de cachemire double face peigné selon la tradition bielloise. Dépourvu d’épaulettes rigides, Le Manteau en Cachemire épouse naturellement la carrure en instaurant un tombé d’aplomb impeccable. Son emmanchure basse et son col tailleur aiguisé au millimètre confèrent une autorité silencieuse. Doublure intégrale en cupro de soie respirant pour une fluidité sans friction sur la maille.',
    composition: '90% Cachemire de Mongolie certifié, 10% Laine Vierge Mérinos peignée',
    origin: 'Tissé en Italie, façonné dans nos ateliers parisiens',
    care: [
      'Nettoyage à sec spécialisé uniquement',
      'Aérer à l’air libre sur cintre large en cèdre',
      'Repassage vapeur vertical doux',
    ],
    variants: [
      { size: 'XS', stock: 3, color: 'Noir Carbone' },
      { size: 'S', stock: 6, color: 'Noir Carbone' },
      { size: 'M', stock: 10, color: 'Noir Carbone' },
      { size: 'L', stock: 4, color: 'Noir Carbone' },
      { size: 'XL', stock: 2, color: 'Noir Carbone' },

      { size: 'XS', stock: 2, color: 'Camel Doré' },
      { size: 'S', stock: 5, color: 'Camel Doré' },
      { size: 'M', stock: 8, color: 'Camel Doré' },
      { size: 'L', stock: 3, color: 'Camel Doré' },
      { size: 'XL', stock: 0, color: 'Camel Doré' },

      { size: 'XS', stock: 1, color: 'Gris Anthracite' },
      { size: 'S', stock: 4, color: 'Gris Anthracite' },
      { size: 'M', stock: 6, color: 'Gris Anthracite' },
      { size: 'L', stock: 2, color: 'Gris Anthracite' },
      { size: 'XL', stock: 0, color: 'Gris Anthracite' },
    ],
    measurements: [
      { size: 'XS', chest: '92 cm', waist: '88 cm', hips: '98 cm', length: '116 cm' },
      { size: 'S', chest: '98 cm', waist: '94 cm', hips: '104 cm', length: '118 cm' },
      { size: 'M', chest: '104 cm', waist: '100 cm', hips: '110 cm', length: '120 cm' },
      { size: 'L', chest: '110 cm', waist: '106 cm', hips: '116 cm', length: '122 cm' },
      { size: 'XL', chest: '116 cm', waist: '112 cm', hips: '122 cm', length: '124 cm' },
    ],
  },
  {
    id: 'foeg-002',
    slug: 'la-chemise-en-soie',
    name: 'La Chemise en Soie',
    price: 490.0,
    currency: '€',
    category: 'Mujer',
    subcategory: 'Chemises',
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Développée dans un crêpe de Chine de soie d’un grammage rare de 19 mommes offrant une opacité totale et un lustre mat subtil. La Chemise en Soie arbore une boutonnière sous patte entièrement invisible cachant des boutons en nacre de Troca façonnés sur mesure. Col français strict adouci par la souplesse de la soie lavée. Chaque couture anglaise est exécutée avec une précision de 7 points par centimètre pour une pureté absolue.',
    composition: '100% Crêpe de Chine de Soie de mûrier biologique',
    origin: 'Soie filée à Lyon, confectionnée à Paris',
    care: [
      'Lavage à la main à l’eau tiède ou nettoyage à sec délicat',
      'Séchage à plat à l’ombre',
      'Repassage sur l’envers à basse température',
    ],
    variants: [
      { size: 'XS', stock: 4, color: 'Écru Naturel' },
      { size: 'S', stock: 8, color: 'Écru Naturel' },
      { size: 'M', stock: 12, color: 'Écru Naturel' },
      { size: 'L', stock: 6, color: 'Écru Naturel' },
      { size: 'XL', stock: 2, color: 'Écru Naturel' },

      { size: 'XS', stock: 3, color: 'Noir Carbone' },
      { size: 'S', stock: 6, color: 'Noir Carbone' },
      { size: 'M', stock: 8, color: 'Noir Carbone' },
      { size: 'L', stock: 4, color: 'Noir Carbone' },
      { size: 'XL', stock: 0, color: 'Noir Carbone' },

      { size: 'XS', stock: 2, color: 'Blanc Ivoire' },
      { size: 'S', stock: 5, color: 'Blanc Ivoire' },
      { size: 'M', stock: 7, color: 'Blanc Ivoire' },
      { size: 'L', stock: 3, color: 'Blanc Ivoire' },
      { size: 'XL', stock: 1, color: 'Blanc Ivoire' },
    ],
    measurements: [
      { size: 'XS', chest: '86 cm', waist: '82 cm', hips: '90 cm', length: '70 cm' },
      { size: 'S', chest: '92 cm', waist: '88 cm', hips: '96 cm', length: '72 cm' },
      { size: 'M', chest: '96 cm', waist: '92 cm', hips: '100 cm', length: '73 cm' },
      { size: 'L', chest: '102 cm', waist: '98 cm', hips: '106 cm', length: '74 cm' },
      { size: 'XL', chest: '108 cm', waist: '104 cm', hips: '112 cm', length: '76 cm' },
    ],
  },
  {
    id: 'foeg-003',
    slug: 'le-pantalon-tailleur',
    name: 'Le Pantalon Tailleur',
    price: 680.0,
    currency: '€',
    category: 'Mujer',
    subcategory: 'Pantalons',
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Une coupe droite intemporelle en gabardine de laine vierge quatre saisons, naturellement stretch et infroissable. Ce pantalon de tailleur présente une taille haute nette sans passants pour préserver la pureté de la ceinture, complétée par un pli central permanent marqué à la presse traditionnelle. Poches passepoilées discrètes et bas de jambe fini par un ourlet invisible cousu main.',
    composition: '100% Gabardine de Laine Vierge froide (Super 130s)',
    origin: 'Tissé en Angleterre, confectionné en France',
    care: [
      'Nettoyage à sec doux uniquement',
      'Suspendre par le bas de jambe sur cintre à pinces',
    ],
    variants: [
      { size: '26', stock: 4, color: 'Bleu Nuit Profond' },
      { size: '28', stock: 8, color: 'Bleu Nuit Profond' },
      { size: '30', stock: 10, color: 'Bleu Nuit Profond' },
      { size: '32', stock: 6, color: 'Bleu Nuit Profond' },
      { size: '34', stock: 4, color: 'Bleu Nuit Profond' },
      { size: '36', stock: 2, color: 'Bleu Nuit Profond' },

      { size: '26', stock: 3, color: 'Noir Carbone' },
      { size: '28', stock: 7, color: 'Noir Carbone' },
      { size: '30', stock: 9, color: 'Noir Carbone' },
      { size: '32', stock: 5, color: 'Noir Carbone' },
      { size: '34', stock: 3, color: 'Noir Carbone' },
      { size: '36', stock: 0, color: 'Noir Carbone' },

      { size: '26', stock: 2, color: 'Gris Anthracite' },
      { size: '28', stock: 5, color: 'Gris Anthracite' },
      { size: '30', stock: 7, color: 'Gris Anthracite' },
      { size: '32', stock: 4, color: 'Gris Anthracite' },
      { size: '34', stock: 2, color: 'Gris Anthracite' },
      { size: '36', stock: 0, color: 'Gris Anthracite' },
    ],
    measurements: [
      { size: '26', waist: '68 cm', hips: '92 cm', inseam: '82 cm', length: '96 cm' },
      { size: '28', waist: '72 cm', hips: '96 cm', inseam: '83 cm', length: '98 cm' },
      { size: '30', waist: '76 cm', hips: '100 cm', inseam: '84 cm', length: '100 cm' },
      { size: '32', waist: '80 cm', hips: '104 cm', inseam: '85 cm', length: '102 cm' },
      { size: '34', waist: '84 cm', hips: '108 cm', inseam: '86 cm', length: '104 cm' },
      { size: '36', waist: '88 cm', hips: '112 cm', inseam: '86 cm', length: '105 cm' },
    ],
  },
  {
    id: 'foeg-004',
    slug: 'le-trench-architectural',
    name: 'Le Trench Architectural',
    price: 1350.0,
    currency: '€',
    category: 'Mujer',
    subcategory: 'Manteaux',
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Relecture minimaliste de l’imperméable classique d’officier. Confectionné dans une gabardine de coton compacté étanche sans enduction synthétique, Le Trench Architectural allie rigueur géométrique et volume fluide. Ceinture nouée sous passants intégrés à la couture latérale et bavolet tempête au dos doublé d’une popeline de coton soyeuse.',
    composition: '100% Coton peigné haute densité déperlant naturel',
    origin: 'Ateliers parisiens de confection étanche',
    care: [
      'Nettoyage délicat en pressing professionnel',
      'Ne pas repasser à fer chaud',
    ],
    variants: [
      { size: 'XS', stock: 2, color: 'Mastic Craie' },
      { size: 'S', stock: 5, color: 'Mastic Craie' },
      { size: 'M', stock: 8, color: 'Mastic Craie' },
      { size: 'L', stock: 4, color: 'Mastic Craie' },
      { size: 'XL', stock: 1, color: 'Mastic Craie' },

      { size: 'XS', stock: 3, color: 'Noir Carbone' },
      { size: 'S', stock: 6, color: 'Noir Carbone' },
      { size: 'M', stock: 7, color: 'Noir Carbone' },
      { size: 'L', stock: 2, color: 'Noir Carbone' },
      { size: 'XL', stock: 0, color: 'Noir Carbone' },
    ],
    measurements: [
      { size: 'XS', chest: '100 cm', waist: '96 cm', hips: '106 cm', length: '120 cm' },
      { size: 'S', chest: '106 cm', waist: '102 cm', hips: '112 cm', length: '122 cm' },
      { size: 'M', chest: '112 cm', waist: '108 cm', hips: '118 cm', length: '124 cm' },
      { size: 'L', chest: '118 cm', waist: '114 cm', hips: '124 cm', length: '125 cm' },
      { size: 'XL', chest: '124 cm', waist: '120 cm', hips: '130 cm', length: '127 cm' },
    ],
  },
  {
    id: 'foeg-005',
    slug: 'la-veste-structuree',
    name: 'La Veste Structurée',
    price: 890.0,
    currency: '€',
    category: 'Mujer',
    subcategory: 'Manteaux',
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Une veste croisée au galbe sculptural façonnée dans un lin normand lourd au grain texturé unique. Contrairement aux lins légers d’été, cette matière d’armure dense maintient une carrure ferme sans se froisser de manière désordonnée. Poches fendues à liseré fin, fente d’aisance unique au dos et revers à pointe acérée.',
    composition: '100% Lin brut de Normandie (420g/m²), doublure 100% Coton satiné',
    origin: 'Lin cultivé en Normandie, confectionné à Paris',
    care: [
      'Nettoyage à sec doux',
      'Repassage vapeur puissant à température modérée',
    ],
    variants: [
      { size: 'XS', stock: 3, color: 'Craie Texturée' },
      { size: 'S', stock: 6, color: 'Craie Texturée' },
      { size: 'M', stock: 8, color: 'Craie Texturée' },
      { size: 'L', stock: 2, color: 'Craie Texturée' },
      { size: 'XL', stock: 1, color: 'Craie Texturée' },

      { size: 'XS', stock: 2, color: 'Noir Carbone' },
      { size: 'S', stock: 5, color: 'Noir Carbone' },
      { size: 'M', stock: 9, color: 'Noir Carbone' },
      { size: 'L', stock: 3, color: 'Noir Carbone' },
      { size: 'XL', stock: 0, color: 'Noir Carbone' },

      { size: 'XS', stock: 1, color: 'Bleu Nuit' },
      { size: 'S', stock: 4, color: 'Bleu Nuit' },
      { size: 'M', stock: 7, color: 'Bleu Nuit' },
      { size: 'L', stock: 2, color: 'Bleu Nuit' },
      { size: 'XL', stock: 0, color: 'Bleu Nuit' },
    ],
    measurements: [
      { size: 'XS', chest: '90 cm', waist: '82 cm', hips: '94 cm', length: '73 cm' },
      { size: 'S', chest: '94 cm', waist: '86 cm', hips: '98 cm', length: '74 cm' },
      { size: 'M', chest: '98 cm', waist: '90 cm', hips: '102 cm', length: '75 cm' },
      { size: 'L', chest: '104 cm', waist: '96 cm', hips: '108 cm', length: '76 cm' },
      { size: 'XL', chest: '110 cm', waist: '102 cm', hips: '114 cm', length: '78 cm' },
    ],
  },
  {
    id: 'foeg-006',
    slug: 'la-robe-fourreau',
    name: 'La Robe Fourreau',
    price: 980.0,
    currency: '€',
    category: 'Mujer',
    subcategory: 'Robes',
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Drapée en plein biais dans un crêpe de laine et soie au tombé hypnotique. La Robe Fourreau crée une colonne allongée sans aucune couture apparente sur les hanches. Encolure ras-du-cou minimale et dos discrètement échancré terminé par une agrafe d’argent ciselée à la flamme. Une pièce silencieuse conçue pour l’éternité.',
    composition: '75% Laine Vierge peignée, 25% Soie naturelle',
    origin: 'Ateliers Haute Suture, Paris',
    care: [
      'Nettoyage délicat sur cintre',
      'Ne pas essorer en machine',
    ],
    variants: [
      { size: 'XS', stock: 2, color: 'Noir Absolu' },
      { size: 'S', stock: 5, color: 'Noir Absolu' },
      { size: 'M', stock: 8, color: 'Noir Absolu' },
      { size: 'L', stock: 3, color: 'Noir Absolu' },
      { size: 'XL', stock: 1, color: 'Noir Absolu' },

      { size: 'XS', stock: 2, color: 'Bordeaux Séquins' },
      { size: 'S', stock: 4, color: 'Bordeaux Séquins' },
      { size: 'M', stock: 6, color: 'Bordeaux Séquins' },
      { size: 'L', stock: 2, color: 'Bordeaux Séquins' },
      { size: 'XL', stock: 0, color: 'Bordeaux Séquins' },

      { size: 'XS', stock: 1, color: 'Bleu Nuit' },
      { size: 'S', stock: 3, color: 'Bleu Nuit' },
      { size: 'M', stock: 5, color: 'Bleu Nuit' },
      { size: 'L', stock: 1, color: 'Bleu Nuit' },
      { size: 'XL', stock: 0, color: 'Bleu Nuit' },
    ],
    measurements: [
      { size: 'XS', chest: '84 cm', waist: '66 cm', hips: '90 cm', length: '126 cm' },
      { size: 'S', chest: '88 cm', waist: '70 cm', hips: '94 cm', length: '128 cm' },
      { size: 'M', chest: '94 cm', waist: '76 cm', hips: '100 cm', length: '130 cm' },
      { size: 'L', chest: '100 cm', waist: '82 cm', hips: '106 cm', length: '132 cm' },
      { size: 'XL', chest: '106 cm', waist: '88 cm', hips: '112 cm', length: '134 cm' },
    ],
  },
  {
    id: 'foeg-007',
    slug: 'polo-noir-avec-ecussons-ton-sur-ton-9790',
    name: 'Polo Noir avec écussons « ton sur ton »',
    price: 160.0,
    currency: '€',
    category: 'Hombre',
    subcategory: 'Chemises',
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Polo de coupe architecturale façonné dans un piqué de coton peigné d’une densité remarquable. Col structuré thermo-fixé pour une tenue pérenne et broderie d’armoiries ton sur ton réalisée au fil de soie mat à Paris.',
    composition: '100% Coton peigné biologique d’Égypte à fibres extra-longues',
    origin: 'Confectionné à la main à Paris',
    care: ['Lavage délicat à 30°C sur l’envers', 'Repassage doux à la vapeur'],
    variants: [
      { size: 'XS', stock: 10, color: 'Noir Carbone' },
      { size: 'S', stock: 25, color: 'Noir Carbone' },
      { size: 'M', stock: 35, color: 'Noir Carbone' },
      { size: 'L', stock: 30, color: 'Noir Carbone' },
      { size: 'XL', stock: 15, color: 'Noir Carbone' },
    ],
    measurements: [
      { size: 'XS', chest: '94 cm', waist: '88 cm', length: '68 cm' },
      { size: 'S', chest: '98 cm', waist: '92 cm', length: '70 cm' },
      { size: 'M', chest: '104 cm', waist: '98 cm', length: '72 cm' },
      { size: 'L', chest: '110 cm', waist: '104 cm', length: '74 cm' },
      { size: 'XL', chest: '116 cm', waist: '110 cm', length: '76 cm' },
    ],
  },
  {
    id: 'foeg-008',
    slug: 'le-costume-drap-de-laine-homme',
    name: 'Le Costume Drap de Laine Homme',
    price: 1650.0,
    currency: '€',
    category: 'Hombre',
    subcategory: 'Manteaux',
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
    ],
    description:
      'Veste tailleur masculine structurée en drap de laine vierge Super 130s. Construction semi-entoilée traditionnelle assurant tombé souverain et confort supérieur.',
    composition: '100% Laine Vierge peignée Super 130s, doublure Bemberg cupro',
    origin: 'Tissé à Biella, façonné dans nos ateliers parisiens',
    care: ['Nettoyage à sec spécialisé uniquement'],
    variants: [
      { size: 'S', stock: 4, color: 'Bleu Nuit' },
      { size: 'M', stock: 8, color: 'Bleu Nuit' },
      { size: 'L', stock: 6, color: 'Bleu Nuit' },
      { size: 'XL', stock: 2, color: 'Bleu Nuit' },
    ],
    measurements: [
      { size: 'S', chest: '98 cm', waist: '84 cm', length: '75 cm' },
      { size: 'M', chest: '104 cm', waist: '90 cm', length: '77 cm' },
      { size: 'L', chest: '110 cm', waist: '96 cm', length: '79 cm' },
      { size: 'XL', chest: '116 cm', waist: '102 cm', length: '81 cm' },
    ],
  },
];

export function getProductBySlug(slug: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: 'Mujer' | 'Hombre'): MockProduct[] {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(currentSlug: string, count: number = 3): MockProduct[] {
  return MOCK_PRODUCTS.filter((p) => p.slug !== currentSlug).slice(0, count);
}
