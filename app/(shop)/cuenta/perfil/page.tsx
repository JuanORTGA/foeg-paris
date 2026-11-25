import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import CustomerDashboardClient from '../CustomerDashboardClient';
import { getUserAddresses, getUserAvatar } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/cuenta?callbackUrl=/cuenta/perfil');
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase().trim();
  const addresses = await getUserAddresses();

  let dbOrders: any[] = [];
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

    if (whereConditions.length > 0) {
      dbOrders = await prisma.order.findMany({
        where: { OR: whereConditions },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }
  } catch (err) {
    console.warn('[PERFIL RECENT ORDERS FETCH ERROR]:', err);
  }

  // TAREA 4: Calcul total des dépenses réglées pour statut VIP (>= 1000€)
  let totalPaidSpent = 0;
  try {
    const whereConditions: any[] = [];
    if (userId) whereConditions.push({ userId });
    if (userEmail) whereConditions.push({ email: { equals: userEmail, mode: 'insensitive' } });
    if (whereConditions.length > 0) {
      const allUserOrders = await prisma.order.findMany({
        where: { OR: whereConditions },
        select: { total: true, status: true },
      });
      const isPaidStatus = (s: string) => {
        if (!s) return false;
        const low = s.toLowerCase();
        return (
          s === 'PAID' ||
          s === 'Payé' ||
          low.includes('préparation') ||
          low.includes('expédi') ||
          low.includes('livré') ||
          low.includes('delivered') ||
          low.includes('shipped')
        );
      };
      totalPaidSpent = allUserOrders
        .filter((o) => isPaidStatus(o.status))
        .reduce((sum, o) => sum + Number(o.total || 0), 0);
    }
  } catch (vipErr) {
    console.warn('[PERFIL VIP CALCULATION NOTE]:', vipErr);
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

  const userAvatar = await getUserAvatar(userId);

  return (
    <CustomerDashboardClient
      user={{
        ...session.user,
        image: userAvatar || (session.user as any)?.image,
      }}
      initialAddresses={addresses}
      recentOrders={recentOrders}
      initialTab="profil"
      isVip={totalPaidSpent >= 1000}
    />
  );
}
