import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import CustomerOrdersClient, { CustomerOrderData } from './CustomerOrdersClient';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const session = await auth();

  // Protection : redirection vers la page de login si non connecté
  if (!session?.user) {
    redirect('/cuenta?callbackUrl=/cuenta/pedidos');
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase().trim();

  let rawOrders: any[] = [];
  try {
    const whereConditions: any[] = [];
    if (userId) {
      whereConditions.push({ userId });
    }
    if (userEmail) {
      whereConditions.push({ email: { equals: userEmail, mode: 'insensitive' } });
      if (session.user.email && session.user.email !== userEmail) {
        whereConditions.push({ email: { equals: session.user.email, mode: 'insensitive' } });
      }
    }

    rawOrders = await prisma.order.findMany({
      where: whereConditions.length > 0 ? { OR: whereConditions } : { id: 'none' },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[CUSTOMER ORDERS FETCH ERROR]:', err);
  }

  // REGLA CRÍTICA: Conversion Decimal -> Number
  const orders: CustomerOrderData[] = rawOrders.map((o) => ({
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
    trackingNumber: o.trackingNumber || 'FOEG-FR-ATELIER',
    items: (o.items || []).map((it: any) => ({
      id: it.id,
      name: it.productName,
      size: it.size,
      quantity: Number(it.quantity),
      price: Number(it.price),
    })),
  }));

  return (
    <CustomerOrdersClient
      orders={orders}
      userEmail={userEmail || ''}
      userName={session.user.name || ''}
    />
  );
}
