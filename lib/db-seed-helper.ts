import { prisma } from './db';
import { MOCK_PRODUCTS } from './mock-data';

export const DEFAULT_SITE_CONTENT = [
  {
    key: 'hero_season',
    section: 'hero',
    valueFr: 'Collection Permanente · Paris 2026',
    valueEn: 'Permanent Collection · Paris 2026',
    valueEs: 'Colección Permanente · París 2026',
  },
  {
    key: 'hero_title_line1',
    section: 'hero',
    valueFr: "L'Élégance",
    valueEn: 'The Silent',
    valueEs: 'La Elegancia',
  },
  {
    key: 'hero_title_line2',
    section: 'hero',
    valueFr: 'Silencieuse',
    valueEn: 'Elegance',
    valueEs: 'Silenciosa',
  },
  {
    key: 'hero_cercle_title',
    section: 'hero',
    valueFr: 'Rejoignez le Cercle Privé',
    valueEn: 'Join the Private Circle',
    valueEs: 'Únase al Círculo Privado',
  },
  {
    key: 'hero_cercle_desc',
    section: 'hero',
    valueFr: 'Accès confidentiel aux précommandes, invitations aux salons de l’Atelier et correspondances exclusives.',
    valueEn: 'Confidential access to pre-orders, invitations to Atelier salons, and exclusive correspondence.',
    valueEs: 'Acceso confidencial a preventas, invitaciones a los salones del Atelier y correspondencia exclusiva.',
  },
  {
    key: 'hero_image',
    section: 'hero',
    valueFr: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85',
    valueEn: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85',
    valueEs: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85',
  },
  {
    key: 'editorial_image',
    section: 'philosophy',
    valueFr: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
    valueEn: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
    valueEs: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
  },
  {
    key: 'philosophy_chapter',
    section: 'philosophy',
    valueFr: 'Chapitre I · Philosophie de Coupe',
    valueEn: 'Chapter I · Tailoring Philosophy',
    valueEs: 'Capítulo I · Filosofía del Corte',
  },
  {
    key: 'philosophy_title',
    section: 'philosophy',
    valueFr: "L'Art de S'habiller",
    valueEn: 'The Art of Dressing',
    valueEs: 'El Arte de Vestir',
  },
  {
    key: 'philosophy_desc',
    section: 'philosophy',
    valueFr: 'Nous ne dessinons pas pour les saisons éphémères, mais pour les décennies. Chaque pièce est pensée comme une structure architecturale : une ligne franche, un volume maîtrisé, une matière d’exception qui vit avec celui qui la porte.',
    valueEn: 'We do not design for fleeting seasons, but for decades. Each piece is designed as an architectural structure: a frank line, a controlled volume, an exceptional fabric that lives with its wearer.',
    valueEs: 'No diseñamos para temporadas efímeras, sino para décadas. Cada prenda se concibe como una estructura arquitectónica: una línea pura, un volumen dominado, un tejido excepcional que dialoga con quien lo porta.',
  },
  // --- SECTION CITATION (Brand Quote) ---
  {
    key: 'quote_text',
    section: 'quote',
    valueFr: "Le vrai luxe est de porter une pièce qui ne crie pas, mais qui murmure l'excellence.",
    valueEn: "True luxury is wearing a piece that does not shout, but whispers excellence.",
    valueEs: "El verdadero lujo es vestir una prenda que no grita, sino que susurra la excelencia.",
  },
  {
    key: 'quote_author',
    section: 'quote',
    valueFr: '— La Maison FOEG',
    valueEn: '— La Maison FOEG',
    valueEs: '— La Maison FOEG',
  },
  // --- SECTION LE JOURNAL (Journal Teaser) ---
  {
    key: 'journal_title',
    section: 'journal',
    valueFr: 'Le Journal de la Maison',
    valueEn: 'The Maison Journal',
    valueEs: 'El Cuaderno de la Maison',
  },
  {
    key: 'journal_subtitle',
    section: 'journal',
    valueFr: "Chroniques de l’atelier, manifestes de la forme et exploration des matières nobles qui sculptent l’allure FOEG.",
    valueEn: "Atelier chronicles, form manifestos, and noble fabric explorations sculpting the FOEG allure.",
    valueEs: "Crónicas del atelier, manifiestos del diseño y exploración de materias nobles que esculpen la silueta FOEG.",
  },
  // --- SECTION LE CERCLE PRIVÉ (VIP) ---
  {
    key: 'vip_title',
    section: 'vip',
    valueFr: 'Rejoignez le Cercle Privé',
    valueEn: 'Join the Private Circle',
    valueEs: 'Únase al Círculo Privado',
  },
  {
    key: 'vip_subtitle',
    section: 'vip',
    valueFr: 'Accès prioritaire aux nouvelles collections, ventes privées et invitations exclusives.',
    valueEn: 'Priority access to new collections, private sales, and exclusive invitations.',
    valueEs: 'Acceso prioritario a nuevas colecciones, ventas privadas e invitaciones exclusivas.',
  },
  {
    key: 'vip_button',
    section: 'vip',
    valueFr: "S'inscrire",
    valueEn: 'Subscribe',
    valueEs: 'Suscribirse',
  },
  // --- SECTION LA BOUTIQUE / ATELIER ---
  {
    key: 'boutique_title',
    section: 'boutique',
    valueFr: 'Visiter notre Atelier',
    valueEn: 'Visit our Atelier',
    valueEs: 'Visite nuestro Atelier',
  },
  {
    key: 'boutique_address',
    section: 'boutique',
    valueFr: '48 Rue Lucien Sampaix, 75010 Paris',
    valueEn: '48 Rue Lucien Sampaix, 75010 Paris',
    valueEs: '48 Rue Lucien Sampaix, 75010 París',
  },
  {
    key: 'boutique_hours',
    section: 'boutique',
    valueFr: 'Du Mardi au Samedi · 11h00 – 19h30',
    valueEn: 'Tuesday to Saturday · 11:00 AM – 7:30 PM',
    valueEs: 'De Martes a Sábado · 11:00 – 19:30',
  },
  {
    key: 'boutique_button',
    section: 'boutique',
    valueFr: 'Prendre Rendez-vous',
    valueEn: 'Book an Appointment',
    valueEs: 'Agendar una Cita',
  },
  {
    key: 'boutique_image',
    section: 'boutique',
    valueFr: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=1600&q=85',
    valueEn: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=1600&q=85',
    valueEs: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=1600&q=85',
  },
  // --- SECTION BANNIÈRE SUPÉRIEURE (Top Announcement) ---
  {
    key: 'topbar_text',
    section: 'announcement',
    valueFr: 'Livraison Signature Offerte dès 500 € · Retours & Échanges sous 30 jours',
    valueEn: 'Complimentary Signature Shipping from €500 · 30-Day Returns & Exchanges',
    valueEs: 'Envío Signature de Cortesía a partir de 500 € · Devoluciones y Cambios en 30 días',
  },
  // --- SECTION PILIERS DE CONFIANCE (Trust & Values) ---
  {
    key: 'values_atelier_title',
    section: 'trust',
    valueFr: 'Atelier Français',
    valueEn: 'French Atelier',
    valueEs: 'Atelier Francés',
  },
  {
    key: 'values_atelier_desc',
    section: 'trust',
    valueFr: 'Confection sur mesure et finitions main au cœur de nos ateliers parisiens.',
    valueEn: 'Tailor-made craftsmanship and hand-finished garments in our Paris ateliers.',
    valueEs: 'Confección a medida y acabados a mano en el corazón de nuestros talleres parisinos.',
  },
  {
    key: 'values_fibers_title',
    section: 'trust',
    valueFr: 'Fibres Responsables',
    valueEn: 'Responsible Noble Fibers',
    valueEs: 'Fibras Nobles Responsables',
  },
  {
    key: 'values_fibers_desc',
    section: 'trust',
    valueFr: 'Soie certifiée, cachemire éthique et laines nobles non traitées chimiquement.',
    valueEn: 'Certified silk, ethical cashmere, and noble wools without chemical treatments.',
    valueEs: 'Seda certificada, cachemira ética y lanas nobles sin tratamientos químicos.',
  },
  {
    key: 'values_shipping_title',
    section: 'trust',
    valueFr: 'Livraison Signature',
    valueEn: 'Signature Delivery',
    valueEs: 'Envío Signature',
  },
  {
    key: 'values_shipping_desc',
    section: 'trust',
    valueFr: 'Expédition neutre en carbone et housse de voyage offerte pour chaque pièce.',
    valueEn: 'Carbon-neutral shipping and complimentary garment travel cover with each piece.',
    valueEs: 'Envío neutro en carbono y funda de viaje de cortesía con cada prenda.',
  },
  {
    key: 'values_returns_title',
    section: 'trust',
    valueFr: 'Essais Privés & Retours',
    valueEn: 'Private Fittings & Returns',
    valueEs: 'Pruebas Privadas y Devoluciones',
  },
  {
    key: 'values_returns_desc',
    section: 'trust',
    valueFr: 'Essais privés à domicile sous 30 jours avec coursier dédié sur rendez-vous.',
    valueEn: '30-day private home fittings with dedicated courier on appointment.',
    valueEs: 'Pruebas privadas en casa bajo 30 días con mensajería dedicada previa cita.',
  },
  // --- SECTION PIED DE PAGE & CONTACT (Footer & Conciergerie) ---
  {
    key: 'footer_tagline',
    section: 'footer',
    valueFr: 'Maison de Confection Française · Haute Couture Silencieuse',
    valueEn: 'French Confection Maison · Silent Haute Couture',
    valueEs: 'Maison de Confección Francesa · Alta Costura Silenciosa',
  },
  {
    key: 'footer_contact_email',
    section: 'footer',
    valueFr: 'concierge@foeg-paris.com',
    valueEn: 'concierge@foeg-paris.com',
    valueEs: 'concierge@foeg-paris.com',
  },
  // --- SECTION MÉDIAS, PHOTOGRAPHIES & VIDÉOS / REELS ---
  {
    key: 'hero_video',
    section: 'media',
    valueFr: '',
    valueEn: '',
    valueEs: '',
  },
  {
    key: 'boutique_caracas_image',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    valueEn: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    valueEs: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
  },
  {
    key: 'vip_banner_image',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
    valueEn: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
    valueEs: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
  },
  {
    key: 'atelier_gallery_1',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    valueEn: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    valueEs: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'atelier_gallery_2',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    valueEn: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    valueEs: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'atelier_gallery_3',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85',
    valueEn: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85',
    valueEs: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'atelier_gallery_4',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
    valueEn: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
    valueEs: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
  },
  {
    key: 'atelier_gallery_5',
    section: 'media',
    valueFr: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85',
    valueEn: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85',
    valueEs: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85',
  },
  // --- SECTION REELS / VIDÉOS EN DIRECT DE L'ATELIER ---
  {
    key: 'reels_title',
    section: 'media',
    valueFr: "L'Atelier en Mouvement",
    valueEn: 'The Atelier in Motion',
    valueEs: 'El Atelier en Movimiento',
  },
  {
    key: 'reels_subtitle',
    section: 'media',
    valueFr: 'Défilé, tombé des soies et coulisses de la haute confection parisienne.',
    valueEn: 'Runway drape, silk movement, and backstage Parisian haute confection.',
    valueEs: 'Pasarela, caída de sedas nobles y backstage de la alta confección parisina.',
  },
  {
    key: 'reel_video_1',
    section: 'media',
    valueFr: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-coat-walking-on-a-runway-41235-large.mp4',
    valueEn: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-coat-walking-on-a-runway-41235-large.mp4',
    valueEs: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-coat-walking-on-a-runway-41235-large.mp4',
  },
  {
    key: 'reel_caption_1',
    section: 'media',
    valueFr: '01 · Allure & Manteau en Double Drap de Cachemire',
    valueEn: '01 · Allure & Double-faced Cashmere Overcoat',
    valueEs: '01 · Silueta & Abrigo en Doble Drap de Cachemira',
  },
  {
    key: 'reel_video_2',
    section: 'media',
    valueFr: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-needle-and-thread-43187-large.mp4',
    valueEn: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-needle-and-thread-43187-large.mp4',
    valueEs: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-needle-and-thread-43187-large.mp4',
  },
  {
    key: 'reel_caption_2',
    section: 'media',
    valueFr: '02 · Point Sellier Main · Atelier Rue Lucien Sampaix',
    valueEn: '02 · Hand Saddle Stitch · Rue Lucien Sampaix Atelier',
    valueEs: '02 · Puntada Manual de Sastrería · Atelier París',
  },
  {
    key: 'reel_video_3',
    section: 'media',
    valueFr: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-a-stylish-black-dress-41369-large.mp4',
    valueEn: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-a-stylish-black-dress-41369-large.mp4',
    valueEs: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-a-stylish-black-dress-41369-large.mp4',
  },
  {
    key: 'reel_caption_3',
    section: 'media',
    valueFr: '03 · Fluidité & Tombé en Crêpe de Soie Pure',
    valueEn: '03 · Fluidity & Pure Silk Crêpe Drape',
    valueEs: '03 · Caída y Fluidez en Crepé de Seda Pura',
  },
  {
    key: 'reel_video_4',
    section: 'media',
    valueFr: 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-on-a-catwalk-wearing-a-minimal-outfit-41233-large.mp4',
    valueEn: 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-on-a-catwalk-wearing-a-minimal-outfit-41233-large.mp4',
    valueEs: 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-on-a-catwalk-wearing-a-minimal-outfit-41233-large.mp4',
  },
  {
    key: 'reel_caption_4',
    section: 'media',
    valueFr: '04 · Coupe Architecturale · Édition Permanente 2026',
    valueEn: '04 · Architectural Cut · Permanent Edition 2026',
    valueEs: '04 · Corte Arquitectónico · Edición Permanente 2026',
  },
];

let productsSeededMemory = false;
let ordersSeededMemory = false;
let contentSeededMemory = false;

export async function ensureProductsSeeded() {
  if (productsSeededMemory) return;
  try {
    const count = await prisma.product.count();
    if (count > 0) {
      productsSeededMemory = true;
      return;
    }

    console.log('[SEED] Auto-initialisation des pièces de la Maison FOEG dans Neon...');
    for (const p of MOCK_PRODUCTS) {
      await prisma.product.create({
        data: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: Number(p.price),
          currency: p.currency,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory || 'Manteaux',
          images: p.images,
          isNew: p.isNew,
          composition: p.composition,
          origin: p.origin,
          care: p.care,
          variants: {
            create: p.variants.map((v) => ({
              size: v.size,
              stock: v.stock,
              color: v.color,
            })),
          },
          measurements: {
            create: p.measurements.map((m) => ({
              size: m.size,
              chest: m.chest || '-',
              waist: m.waist || '-',
              hips: m.hips || '-',
              length: m.length || (m.inseam ? `Entrejambe: ${m.inseam}` : '-'),
            })),
          },
        },
      });
    }
    console.log('[SEED] ✓ 6 pièces de Haute Couture enregistrées dans Neon.');
    productsSeededMemory = true;
  } catch (err: any) {
    console.warn('[SEED WARNING] ensureProductsSeeded:', err?.message || err);
  }
}

export async function ensureOrdersSeeded() {
  if (ordersSeededMemory) return;
  try {
    const count = await prisma.order.count();
    if (count > 0) {
      ordersSeededMemory = true;
      return;
    }

    console.log('[SEED] Initialisation des commandes de prestige dans Neon...');
    const demoOrders = [
      {
        orderNumber: 'CMD-2026-0891',
        email: 'c.delatour@cabinet-lt.fr',
        firstName: 'Claire',
        lastName: 'de La Tour',
        address: '14 Rue de l’Université',
        city: 'Paris',
        postalCode: '75007',
        total: 1850.0,
        currency: 'EUR',
        status: 'En attente',
        items: {
          create: [
            {
              productName: 'Le Manteau en Cachemire',
              size: 'S',
              quantity: 1,
              price: 1850.0,
            },
          ],
        },
      },
      {
        orderNumber: 'CMD-2026-0890',
        email: 'h.beaumont@chateau-b.fr',
        firstName: 'Henri',
        lastName: 'de Beaumont',
        address: 'Château de Beaumont, Route des Vignes',
        city: 'Bordeaux',
        postalCode: '33000',
        total: 1170.0,
        currency: 'EUR',
        status: 'Expédié',
        trackingNumber: 'FR-DHL-9920192',
        items: {
          create: [
            {
              productName: 'La Chemise en Soie',
              size: 'M',
              quantity: 1,
              price: 490.0,
            },
            {
              productName: 'Le Pantalon Tailleur',
              size: 'M',
              quantity: 1,
              price: 680.0,
            },
          ],
        },
      },
    ];

    for (const ord of demoOrders) {
      await prisma.order.create({ data: ord });
    }
    console.log('[SEED] ✓ Commandes de démonstration enregistrées dans Neon.');
    ordersSeededMemory = true;
  } catch (err: any) {
    console.warn('[SEED WARNING] ensureOrdersSeeded:', err?.message || err);
  }
}

export async function ensureContentSeeded() {
  if (contentSeededMemory) return;
  try {
    const existing = await (prisma as any).siteContent.findMany({
      select: { key: true },
    });
    const existingKeys = new Set((existing || []).map((e: any) => e.key));
    const missing = DEFAULT_SITE_CONTENT.filter((item) => !existingKeys.has(item.key));

    if (missing.length > 0) {
      await (prisma as any).siteContent.createMany({
        data: missing,
        skipDuplicates: true,
      });
      console.log(`[SEED] ✓ ${missing.length} nouveaux médias et textes CMS synchronisés en 1 seule requête dans Neon.`);
    }
    contentSeededMemory = true;
  } catch (err: any) {
    console.warn('[SEED WARNING] ensureContentSeeded:', err?.message || err);
  }
}
