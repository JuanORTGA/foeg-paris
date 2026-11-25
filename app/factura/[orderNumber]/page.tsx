import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import FacturaClient from './FacturaClient';

export const dynamic = 'force-dynamic';

interface FacturaPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function FacturaPage({ params }: FacturaPageProps) {
  const { orderNumber } = await params;

  if (!orderNumber) {
    notFound();
  }

  // Permite buscar tanto por orderNumber (ej: FOEG-2026-XXXX) como por id interno de la orden
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: orderNumber },
        { id: orderNumber },
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

  // Serialización segura de fechas para Client Components en Next.js
  const serializedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null,
  };

  return <FacturaClient order={serializedOrder} />;
}
