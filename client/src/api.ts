const BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; manager: { id: string; email: string; name: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getReviews: (params: Record<string, string | number>) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)]))
    ).toString();
    return request<import('./types').ReviewsResponse>(`/reviews${qs ? `?${qs}` : ''}`);
  },

  getStats: () => request<import('./types').Stats>('/reviews/stats'),

  getReview: (id: string) => request<import('./types').Review>(`/reviews/${id}`),

  createReview: (data: object) =>
    request<import('./types').Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  analyzeReview: (id: string) =>
    request<import('./types').Review>(`/reviews/${id}/analyze`, { method: 'POST' }),

  deleteReview: (id: string) => request<void>(`/reviews/${id}`, { method: 'DELETE' }),

  submitFeedback: (data: { customerName?: string; productName: string; starRating: number; reviewText: string; category: string }) =>
    fetch(`${BASE.replace('/api', '')}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};
