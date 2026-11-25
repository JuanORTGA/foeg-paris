import React from 'react';
import { getSeoSettings } from '@/lib/settings-actions';
import AdminSeoClient from './AdminSeoClient';

export const dynamic = 'force-dynamic';

export default async function AdminSeoPage() {
  const seoSettings = await getSeoSettings();

  return <AdminSeoClient initialSettings={seoSettings} />;
}
