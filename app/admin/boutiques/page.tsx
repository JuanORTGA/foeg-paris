import React from 'react';
import { getBoutiques } from '@/lib/boutiques-actions';
import AdminBoutiquesClient from './AdminBoutiquesClient';

export const metadata = {
  title: 'Boutiques & Points de Vente | Administration FOEG Paris',
  description: 'Gestion du réseau physique de boutiques et salons privés Maison FOEG.',
};

export default async function AdminBoutiquesPage() {
  const boutiques = await getBoutiques();

  return <AdminBoutiquesClient initialBoutiques={boutiques} />;
}
