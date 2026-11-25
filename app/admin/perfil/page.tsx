import React from 'react';
import { getAdminProfile } from '@/lib/admin-profile-actions';
import AdminPerfilClient from './AdminPerfilClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mon Profil & Sécurité | Administration FOEG Paris',
  description: 'Paramètres du compte administrateur et sécurité de la Direction FOEG.',
};

export default async function AdminPerfilPage() {
  const profile = await getAdminProfile();

  return <AdminPerfilClient initialProfile={profile} />;
}
