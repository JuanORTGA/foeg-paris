import React from 'react';
import { getNewsletterSubscribers, getNewsletterCampaigns } from '@/lib/newsletter-actions';
import NewsletterClient from './NewsletterClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const [subscribers, campaigns] = await Promise.all([
    getNewsletterSubscribers(),
    getNewsletterCampaigns(),
  ]);

  return (
    <NewsletterClient
      initialSubscribers={subscribers}
      initialCampaigns={campaigns}
    />
  );
}

