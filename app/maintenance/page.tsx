import React from 'react';
import type { Metadata } from 'next';
import MaintenanceClient from './MaintenanceClient';

export const metadata: Metadata = {
  title: 'Atelier en Pause · Maison FOEG Paris',
  description: 'Notre Atelier est en pause. Nous revenons très vite avec la nouvelle collection.',
};

export default function MaintenancePage() {
  return <MaintenanceClient />;
}
