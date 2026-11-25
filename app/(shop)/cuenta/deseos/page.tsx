import React from 'react';
import { Metadata } from 'next';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
  title: 'Liste de Désirs | FOEG Paris',
  description: 'Votre sélection de créations d’exception et pièces sauvegardées de la Maison FOEG Paris.',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
