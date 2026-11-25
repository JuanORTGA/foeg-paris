import React from 'react';
import { prisma } from '@/lib/db';
import AdminClientesClient, { ClientRow } from './AdminClientesClient';

export const dynamic = 'force-dynamic';

export default async function AdminClientesPage() {
  let dbUsers: any[] = [];
  let dbOrders: any[] = [];

  try {
    [dbUsers, dbOrders] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          addresses: {
            select: {
              phone: true,
              address: true,
              city: true,
              postalCode: true,
              country: true,
              isDefault: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          total: true,
          status: true,
          createdAt: true,
          userId: true,
          address: true,
          city: true,
          postalCode: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  } catch (err) {
    console.warn('[ADMIN CLIENTES DB FETCH ERROR]:', err);
  }

  const clientsMap = new Map<string, ClientRow>();

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

  // 1. Agregar usuarios registrados en Prisma User
  if (dbUsers && dbUsers.length > 0) {
    for (const u of dbUsers) {
      const emailKey = u.email.toLowerCase().trim();
      const userOrders = dbOrders.filter(
        (o) =>
          (o.userId && o.userId === u.id) ||
          (o.email && o.email.toLowerCase().trim() === emailKey)
      );

      const ordersCount = userOrders.length;
      const userPaidOrders = userOrders.filter((o) => isPaidStatus(o.status));
      const totalSpent = userPaidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const defaultAddr = u.addresses?.find((a: any) => a.isDefault) || u.addresses?.[0];

      clientsMap.set(emailKey, {
        id: u.id,
        name: u.name || 'Client Atelier',
        email: u.email,
        role: u.role,
        memberSince: new Date(u.createdAt).toLocaleDateString('fr-FR', {
          month: 'short',
          year: 'numeric',
        }),
        ordersCount,
        totalSpent,
        isRegistered: true,
        phone: defaultAddr?.phone || undefined,
        city: defaultAddr?.city || undefined,
        country: defaultAddr?.country || undefined,
        address: defaultAddr?.address || undefined,
      });
    }
  }

  // 2. Agregar compradores de pedidos que no tengan aún cuenta User
  if (dbOrders && dbOrders.length > 0) {
    for (const o of dbOrders) {
      if (!o.email) continue;
      const emailKey = o.email.toLowerCase().trim();

      if (!clientsMap.has(emailKey)) {
        const clientOrders = dbOrders.filter(
          (item) => item.email && item.email.toLowerCase().trim() === emailKey
        );
        const clientPaidOrders = clientOrders.filter((item) => isPaidStatus(item.status));
        const totalSpent = clientPaidOrders.reduce((sum, item) => sum + Number(item.total || 0), 0);
        const fullName = `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'Client Boutique';

        clientsMap.set(emailKey, {
          id: `guest-${emailKey}`,
          name: fullName,
          email: o.email,
          role: 'CUSTOMER',
          memberSince: new Date(o.createdAt).toLocaleDateString('fr-FR', {
            month: 'short',
            year: 'numeric',
          }),
          ordersCount: clientOrders.length,
          totalSpent,
          isRegistered: false,
          city: o.city || undefined,
          address: o.address || undefined,
        });
      }
    }
  }

  let clients: ClientRow[] = Array.from(clientsMap.values());

  // Si no hay datos (ej: base vacía), fallback a demo representativo
  if (clients.length === 0) {
    clients = [
      {
        id: 'usr-demo-01',
        name: 'Claire de La Tour',
        email: 'c.delatour@cabinet-lt.fr',
        role: 'CUSTOMER',
        memberSince: 'nov. 2026',
        ordersCount: 1,
        totalSpent: 1850,
        isRegistered: true,
        phone: '+33 6 12 34 56 78',
        city: 'Paris',
        country: 'FR',
      },
      {
        id: 'usr-demo-02',
        name: 'Henri de Beaumont',
        email: 'h.beaumont@chateau-b.fr',
        role: 'CUSTOMER',
        memberSince: 'nov. 2026',
        ordersCount: 1,
        totalSpent: 1170,
        isRegistered: true,
        phone: '+33 5 56 00 11 22',
        city: 'Bordeaux',
        country: 'FR',
      },
    ];
  }

  return <AdminClientesClient initialClients={clients} />;
}
