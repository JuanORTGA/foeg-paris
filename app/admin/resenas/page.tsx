import React from 'react';
import AdminResenasClient from './AdminResenasClient';
import { getAdminReviews, getProductsForReviews } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminResenasPage() {
  const [reviews, products] = await Promise.all([
    getAdminReviews(),
    getProductsForReviews(),
  ]);

  return <AdminResenasClient initialReviews={reviews} products={products} />;
}
