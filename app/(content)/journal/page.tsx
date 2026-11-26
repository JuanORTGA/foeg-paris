import React from 'react';
import { getJournalArticles } from '@/lib/journal-actions';
import JournalClient from './JournalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Journal & Chroniques | FOEG Paris',
  description: 'Essais sur le vêtement structurel, dialogues d’ateliers et exploration de la matérialité.',
};

export default async function JournalPage() {
  const articles = await getJournalArticles();
  return <JournalClient articles={articles} />;
}
