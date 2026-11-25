import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import CuentaAuthClient from './CuentaAuthClient';
import CustomerDashboardClient from './CustomerDashboardClient';
import { getUserAddresses } from './actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function CuentaPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const callbackUrl = params.callbackUrl || '/';

  // Si l'utilisateur n'est pas connecté, afficher le formulaire de connexion / inscription
  if (!session?.user) {
    return <CuentaAuthClient callbackUrl={callbackUrl} />;
  }

  // Utilisateur connecté -> Charger son profil, ses adresses et ses commandes récentes
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
    console.warn('[CUENTA RECENT ORDERS FETCH ERROR]:', err);
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
    />
  );
}
