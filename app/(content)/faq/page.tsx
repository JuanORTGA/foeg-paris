import React from 'react';
import FaqClient from './FaqClient';

export const metadata = {
  title: 'Foire Aux Questions · Maison FOEG Paris',
  description: 'Réponses aux questions fréquentes sur la confection, livraison, retours et rendez-vous privés en atelier FOEG Paris.',
};

export default function FaqPage() {
  return <FaqClient />;
}
