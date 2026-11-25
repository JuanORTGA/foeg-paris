import React from 'react';
import { getJournalArticles } from '@/lib/journal-actions';
import JournalClient from './JournalClient';

export const revalidate = 60; // Habilita ISR de 60s y navegación instantánea

export const metadata = {
  title: 'Journal & Chroniques | FOEG Paris',
  description: 'Essais sur le vêtement structurel, dialogues d’ateliers et exploration de la matérialité.',
};

export default async function JournalPage() {
  const articles = await getJournalArticles();
  return <JournalClient articles={articles} />;
}
