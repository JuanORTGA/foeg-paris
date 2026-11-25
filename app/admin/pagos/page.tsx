import React from 'react';
import { getPaymentSettings } from '@/lib/payment-settings-actions';
import AdminPagosClient from './AdminPagosClient';

export const metadata = {
  title: 'Passerelles de Paiement · FOEG Paris Admin',
  description: 'Configuration des clés Stripe, PayPal, IBAN Français et méthodes de paiement alternatives.',
};

export const dynamic = 'force-dynamic';

export default async function AdminPagosPage() {
  const settings = await getPaymentSettings();

  return <AdminPagosClient initialSettings={settings} />;
}
