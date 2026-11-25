import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import CustomerOrderDetailClient, { OrderDetailData } from './CustomerOrderDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerOrderDetailPage({ params }: Props) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id },
      ],
    },
    include: {
      items: true,
      transactions: true,
    },
  });

  if (!order) {
    notFound();
  }

  const serializedOrder: OrderDetailData = {
    id: order.id,
    orderNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode,
    total: Number(order.total),
    currency: order.currency || 'EUR',
    status: order.status,
    trackingNumber: order.trackingNumber || 'FOEG-FR-ATELIER',
    items: (order.items || []).map((it) => ({
      id: it.id,
      name: it.productName,
      size: it.size,
      quantity: Number(it.quantity),
      price: Number(it.price),
    })),
  };

  return <CustomerOrderDetailClient order={serializedOrder} />;
}
