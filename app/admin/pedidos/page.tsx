import React from 'react';
import { prisma } from '@/lib/db';
import { ensureOrdersSeeded } from '@/lib/db-seed-helper';
import AdminPedidosClient, { AdminOrderData } from './AdminPedidosClient';

export const dynamic = 'force-dynamic';

export default async function AdminPedidosPage() {
  // 1. Initialisation automatique non-bloquante
  ensureOrdersSeeded().catch(() => {});

  // 2. Récupération des commandes réelles sans timeout artificiel
  let rawOrders: any[] = [];
  try {
    rawOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        address: true,
        city: true,
        postalCode: true,
        total: true,
        currency: true,
        status: true,
        trackingNumber: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            size: true,
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[ADMIN PEDIDOS FETCH ERROR]:', err);
  }

  // 3. Conversion Decimal -> Number pour sérialisation Server -> Client
  const sanitizedOrders: AdminOrderData[] = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    firstName: o.firstName,
    lastName: o.lastName,
    address: o.address,
    city: o.city,
    postalCode: o.postalCode,
    total: Number(o.total),
    currency: o.currency,
    status: o.status,
    trackingNumber: o.trackingNumber,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((it: any) => ({
      id: it.id,
      productName: it.productName,
      size: it.size,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  }));

  return <AdminPedidosClient initialOrders={sanitizedOrders} />;
}
