export type GenderCategory = 'femme' | 'homme' | 'unisexe';

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  price: number;
  currency: string;
  category: GenderCategory;
  subcategory: string;
  materials: string[];
  colors: {
    name: string;
    hex: string;
  }[];
  sizes: string[];
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
  }[];
  details: string[];
  careInstructions: string[];
  origin: string; // e.g. "Fabriqué à Paris, France"
  inStock: boolean;
  isNewArrival?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readingTime: string;
  author: string;
  coverImage: string;
  tags: string[];
}
