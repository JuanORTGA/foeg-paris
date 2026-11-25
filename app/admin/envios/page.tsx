import React from 'react';
import { getShippingSettings } from '@/lib/shipping-actions';
import AdminEnviosClient from './AdminEnviosClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gestion des Expéditions · Backstage Maison FOEG',
  description: 'Configuration des tarifs et règles de livraison nationales et internationales.',
};

export default async function AdminEnviosPage() {
  const settings = await getShippingSettings();
  return <AdminEnviosClient initialSettings={settings} />;
}
