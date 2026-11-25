export interface AdminReviewItem {
  id: string;
  productId?: string;
  productName: string;
  productSlug: string;
  userName: string;
  userEmail: string;
  rating: number;
  fit: 'SMALL' | 'TRUE_TO_SIZE' | 'LARGE' | string;
  comment: string;
  imageUrl?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface ReviewFormData {
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  fit: 'SMALL' | 'TRUE_TO_SIZE' | 'LARGE';
  comment: string;
  imageUrl?: string | null;
  isApproved: boolean;
}
