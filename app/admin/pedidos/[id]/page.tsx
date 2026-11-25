import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import OrderDetailClient from './OrderDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  let order = null;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
  } catch (err) {
    console.error('[ADMIN ORDER DETAIL ERROR]:', err);
  }

  // Si no se encuentra en DB, buscar por orderNumber
  if (!order) {
    try {
      order = await prisma.order.findFirst({
        where: { orderNumber: id },
        include: { items: true },
      });
    } catch (_) {}
  }

  if (!order) {
    return notFound();
  }

  // Récupérer les images des pièces commandées
  const productIds = order.items.map((it) => it.productId).filter(Boolean) as string[];
  const productNames = order.items.map((it) => it.productName);
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: productIds } },
          { name: { in: productNames } },
        ],
      },
      select: { id: true, name: true, images: true },
    });
  } catch (_) {}

  const productMap = new Map<string, string>();
  for (const p of products) {
    if (p.images && p.images.length > 0) {
      productMap.set(p.id, p.images[0]);
      productMap.set(p.name, p.images[0]);
    }
  }

  const sanitizedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode,
    total: Number(order.total),
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod || 'CARTE BANCAIRE',
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      size: it.size,
      quantity: Number(it.quantity),
      price: Number(it.price),
      image:
        (it.productId ? productMap.get(it.productId) : null) ||
        productMap.get(it.productName) ||
        '/images/coat-hero.jpg',
    })),
  };

  return <OrderDetailClient order={sanitizedOrder} />;
}
