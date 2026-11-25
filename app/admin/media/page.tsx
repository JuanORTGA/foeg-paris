import React from 'react';
import { getMediaLibrary } from './actions';
import AdminMediaClient from './AdminMediaClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Médiathèque · Backstage Maison FOEG',
  description: 'Galerie de photographies haute définition pour les collections et le CMS FOEG Paris.',
};

export default async function AdminMediaPage() {
  const mediaItems = await getMediaLibrary();
  return <AdminMediaClient initialMedia={mediaItems} />;
}
