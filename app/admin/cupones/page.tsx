import React from 'react';
import { getCoupons, createCoupon } from './actions';
import AdminCuponesClient from './AdminCuponesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCuponesPage() {
  let coupons = await getCoupons();

  // Si aucun coupon n'existe, semer VIP20 par défaut
  if (coupons.length === 0) {
    await createCoupon({
      code: 'VIP20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
    });
    coupons = await getCoupons();
  }

  return <AdminCuponesClient initialCoupons={coupons} />;
}
