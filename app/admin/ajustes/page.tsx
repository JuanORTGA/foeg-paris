import React from 'react';
import { getGlobalSettings } from '@/lib/settings-actions';
import AdminAjustesClient from './AdminAjustesClient';

export const dynamic = 'force-dynamic';

export default async function AdminAjustesPage() {
  const settings = await getGlobalSettings();

  return <AdminAjustesClient initialSettings={settings} />;
}
