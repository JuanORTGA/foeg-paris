export interface Boutique {
  id: string;
  name: string;             // Ex: "Maison FOEG Paris · Atelier & Boutique"
  tag: string;              // Ex: "Maison Mère & Atelier" | "Boutique & Salon Privé"
  city: string;             // Ex: "Paris", "Caracas", "Madrid", "Miami", "Milano"
  country: string;          // Ex: "France", "Venezuela", "Espagne", "États-Unis"
  address: string;          // Ex: "48 Rue Lucien Sampaix", "Boutique Privée FOEG"
  postalCode?: string;      // Ex: "75010", "1060"
  addressNotes?: string;    // Notes pour les adresses confidentielles ou à venir
  hoursWeekday: string;     // Ex: "Mardi — Samedi : 11h00 — 19h30"
  hoursWeekend: string;     // Ex: "Dimanche & Lundi : Sur rendez-vous privé"
  phone?: string;           // Ex: "+33 1 42 68 55 00"
  whatsapp?: string;        // Ex: "+33 6 12 34 56 78"
  email?: string;           // Ex: "concierge@foeg-paris.com"
  imageUrl: string;         // URL de l'image représentative
  googleMapsUrl?: string;   // Lien interactif Google Maps
  isActive: boolean;        // Visible sur le site public
  enablePickup: boolean;    // Disponible pour le retrait de commande (Click & Collect)
  orderIndex: number;       // Ordre d'affichage
  createdAt: string;
}

export const DEFAULT_BOUTIQUES: Boutique[] = [
  {
    id: 'boutique-paris',
    name: 'Maison FOEG Paris · Atelier & Boutique',
    tag: 'Siège Social & Atelier de Confection',
    city: 'Paris',
    country: 'France',
    address: '48 Rue Lucien Sampaix',
    postalCode: '75010',
    addressNotes: 'Paris 10ème arrondissement, au cœur du quartier historique des tailleurs parisiens.',
    hoursWeekday: 'Mardi — Samedi : 11h00 — 19h30',
    hoursWeekend: 'Dimanche & Lundi : Sur rendez-vous privé',
    phone: '+33 1 42 68 55 00',
    whatsapp: '+33 6 12 34 56 78',
    email: 'concierge@foeg-paris.com',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    googleMapsUrl: 'https://maps.google.com/?q=48+rue+Lucien+Sampaix+75010+Paris+France',
    isActive: true,
    enablePickup: true,
    orderIndex: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'boutique-caracas',
    name: 'FOEG Venezuela · Boutique & Salon Privé',
    tag: 'Boutique & Salon Privé',
    city: 'Caracas',
    country: 'Venezuela',
    address: 'Boutique Privée FOEG',
    postalCode: '1060',
    addressNotes: "L'adresse exacte (Altamira / Las Mercedes / centre commercial) sera communiquée lors de la confirmation de votre commande ou de votre rendez-vous.",
    hoursWeekday: 'Lundi — Samedi : 10h00 — 18h30',
    hoursWeekend: 'Dimanche : Sur rendez-vous préalable',
    phone: '+58 414 928 10 49',
    whatsapp: '+58 414 928 10 49',
    email: 'concierge@foeg-paris.com',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
    googleMapsUrl: '',
    isActive: true,
    enablePickup: true,
    orderIndex: 2,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];
