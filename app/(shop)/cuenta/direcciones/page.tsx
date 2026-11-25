import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import CustomerDashboardClient from '../CustomerDashboardClient';
import { getUserAddresses } from '../actions';

export const dynamic = 'force-dynamic';

export default async function DireccionesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/cuenta?callbackUrl=/cuenta/direcciones');
  }

  const userEmail = session.user.email?.toLowerCase().trim();
  const addresses = await getUserAddresses();

  let dbOrders: any[] = [];
  try {
    if (userEmail) {
      dbOrders = await prisma.order.findMany({
        where: { email: userEmail },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }
  } catch (err) {
    console.warn('[DIRECCIONES RECENT ORDERS FETCH ERROR]:', err);
  }

  const recentOrders = dbOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    date: new Date(o.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    total: Number(o.total),
    currency: o.currency || 'EUR',
    status: o.status,
    itemsCount: Array.isArray(o.items) ? o.items.length : 0,
  }));

  return (
    <CustomerDashboardClient
      user={session.user}
      initialAddresses={addresses}
      recentOrders={recentOrders}
      initialTab="adresses"
    />
  );
}
