import React from 'react';
import { notFound } from 'next/navigation';
import { getJournalArticleBySlug, getJournalArticles } from '@/lib/journal-actions';
import { JOURNAL_ARTICLES } from '@/lib/journal-data';
import JournalDetailClient from './JournalDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return JOURNAL_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getJournalArticleBySlug(slug),
    getJournalArticles(),
  ]);

  if (!article) {
    return notFound();
  }

  return <JournalDetailClient article={article} allArticles={allArticles} />;
}
