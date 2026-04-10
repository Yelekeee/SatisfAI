export interface Manager {
  id: string;
  email: string;
  name: string;
}

export interface Review {
  id: string;
  customerName: string | null;
  productName: string;
  marketplace: string | null;
  starRating: number;
  reviewText: string;
  category: string;
  createdAt: string;
  aiSentiment: string | null;
  aiSentimentScore: number | null;
  aiCategory: string | null;
  aiCustomerClass: string | null;
  aiKeyPhrases: string[] | null;
  aiComplaintSummary: string | null;
  aiEmotion: string | null;
  aiAnalyzedAt: string | null;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface Stats {
  total: number;
  sentimentCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  avgRating: number | null;
  recentNegative: number;
}
