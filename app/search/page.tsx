import React from 'react';
import { searchProducts } from './actions';
import { MockProduct } from '@/lib/mock-data';
import SearchClient from './SearchClient';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = (params.q || '').trim();
  const sort = params.sort || 'relevance';

  let products: MockProduct[] = [];
  if (query) {
    products = await searchProducts(query);
  }

  // Tri si demandé
  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  }

  return <SearchClient query={query} products={products} />;
}
