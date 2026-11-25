'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  userId?: string | null;
  createdAt: Date | string;
}

export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  link?: string;
  userId?: string | null;
}) {
  try {
    const notification = await (prisma as any).notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        link: data.link || null,
        userId: data.userId || null,
        isRead: false,
      },
    });
    try {
      revalidatePath('/admin');
      if (data.userId) {
        revalidatePath('/cuenta');
      }
    } catch {}
    return { success: true, notification };
  } catch (error: any) {
    console.error('[NOTIFICATION ERROR]:', error?.message || error);
    return { success: false, error: error?.message };
  }
}

export async function getUserNotifications(userId: string): Promise<AdminNotification[]> {
  try {
    const items = await (prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return items.map((it: any) => ({
      id: it.id,
      title: it.title,
      message: it.message,
      type: it.type,
      isRead: it.isRead,
      link: it.link,
      userId: it.userId,
      createdAt: it.createdAt,
    }));
  } catch (err) {
    return [];
  }
}

export async function getUserUnreadCount(userId: string): Promise<number> {
  try {
    const count = await (prisma as any).notification.count({
      where: { userId, isRead: false },
    });
    return count;
  } catch {
    return 0;
  }
}

export async function getUnreadNotifications(): Promise<AdminNotification[]> {
  try {
    const items = await (prisma as any).notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    });
    return items.map((it: any) => ({
      id: it.id,
      title: it.title,
      message: it.message,
      type: it.type,
      isRead: it.isRead,
      link: it.link,
      createdAt: it.createdAt,
    }));
  } catch (err) {
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await (prisma as any).notification.update({
      where: { id },
      data: { isRead: true },
    });
    try {
      revalidatePath('/admin');
    } catch {}
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await (prisma as any).notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    try {
      revalidatePath('/admin');
    } catch {}
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
