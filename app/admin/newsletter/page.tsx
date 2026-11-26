import React from 'react';
import { prisma } from '@/lib/db';
import { getNewsletterSubscribers, getNewsletterCampaigns } from '@/lib/newsletter-actions';
import NewsletterClient from './NewsletterClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const [subscribers, campaigns, users, orders] = await Promise.all([
    getNewsletterSubscribers(),
    getNewsletterCampaigns(),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: {
        total: true,
        email: true,
        userId: true,
      },
    }),
  ]);

  // Calcul des dépenses cumulées par courriel
  const spentByEmail: Record<string, number> = {};
  for (const o of orders) {
    const e = (o.email || '').toLowerCase().trim();
    if (e) {
      spentByEmail[e] = (spentByEmail[e] || 0) + Number(o.total || 0);
    }
  }

  // Filtrage des comptes clients enregistrés (hors ADMIN)
  const customerUsers = users.filter((u) => u.role !== 'ADMIN');
  const userMap: Record<string, { id: string; name: string | null; email: string }> = {};
  for (const u of customerUsers) {
    if (u.email) {
      userMap[u.email.toLowerCase().trim()] = {
        id: u.id,
        name: u.name,
        email: u.email,
      };
    }
  }

  const registeredClientsCount = customerUsers.length;
  const registeredVipCount = customerUsers.filter(
    (u) => (spentByEmail[u.email?.toLowerCase().trim()] || 0) >= 1000
  ).length;
  const registeredNormalCount = registeredClientsCount - registeredVipCount;

  // Enrichissement des abonnés avec les données Neon DB
  const enrichedSubscribers = subscribers.map((sub) => {
    const emailKey = sub.email.toLowerCase().trim();
    const registeredAccount = userMap[emailKey];
    const totalSpent = spentByEmail[emailKey] || 0;
    const isVipSource =
      sub.source.toLowerCase().includes('vip') || sub.source.toLowerCase().includes('cercle');
    const isQualifiedVip = isVipSource || totalSpent >= 1000;

    return {
      ...sub,
      hasUserAccount: Boolean(registeredAccount),
      userName: registeredAccount?.name || null,
      totalSpent,
      isQualifiedVip,
    };
  });

  return (
    <NewsletterClient
      initialSubscribers={enrichedSubscribers}
      initialCampaigns={campaigns}
      clientStats={{
        registeredTotal: registeredClientsCount,
        registeredVip: registeredVipCount,
        registeredNormal: registeredNormalCount,
      }}
    />
  );
}

