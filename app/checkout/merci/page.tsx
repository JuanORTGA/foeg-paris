import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getBcvRate } from '@/lib/bcv';
import { getPublicPaymentSettings } from '@/lib/payment-settings-actions';
import { DEFAULT_PAYMENT_SETTINGS } from '@/lib/payment-settings-types';
import MerciClient from './MerciClient';

export const dynamic = 'force-dynamic';

interface MerciPageProps {
  searchParams: Promise<{
    orderId?: string;
    provider?: string;
    method?: string;
    ref?: string;
  }>;
}

export default async function MerciPage({ searchParams }: MerciPageProps) {
  const { orderId, method, ref } = await searchParams;

  if (!orderId) {
    return (
      <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-2xl mx-auto text-center space-y-6">
        <h1 className="font-serif text-3xl font-light text-foeg-black">
          Commande Introuvable
        </h1>
        <p className="text-xs text-foeg-muted font-light">
          Aucun identifiant de commande valide n’a été transmis.
        </p>
        <Link
          href="/"
          className="inline-block bg-foeg-navy text-white px-8 py-3 text-xs uppercase tracking-wider font-medium"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  let order: any = null;
  let bcvRate = 62.50;
  let paymentSettings: any = DEFAULT_PAYMENT_SETTINGS;

  try {
    const [dbOrder, rate, pSettings] = await Promise.all([
      prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          transactions: true,
        },
      }),
      getBcvRate(),
      getPublicPaymentSettings(),
    ]);

    order = dbOrder;
    bcvRate = rate;
    if (pSettings) paymentSettings = pSettings;
  } catch (err) {
    console.error('[MERCI PAGE FETCH ERROR]:', err);
  }

  if (!order) {
    return notFound();
  }

  const paymentMethod = method || order.transactions?.[0]?.paymentMethod || (order as any).paymentMethod || 'STRIPE';

  return (
    <MerciClient
      order={order}
      paymentMethod={paymentMethod}
      refParam={ref}
      bcvRate={bcvRate}
      paymentSettings={paymentSettings}
    />
  );
}
