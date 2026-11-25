import React from 'react';
import { getActiveBoutiques } from '@/lib/boutiques-actions';
import BoutiqueClient from './BoutiqueClient';

export const metadata = {
  title: 'Nos Boutiques & Salons Privés | Maison FOEG Paris',
  description:
    'Découvrez les boutiques et écrins physiques de la Maison FOEG à Paris (rue Lucien Sampaix) et Caracas (Venezuela). Essayages privés et retrait en boutique.',
};

export default async function BoutiquePage() {
  const boutiques = await getActiveBoutiques();

  return <BoutiqueClient boutiques={boutiques} />;
}
