import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, Trash2, Sparkles, Star, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { api } from '../api';
import type { Review } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  quality: 'Качество',
  delivery: 'Доставка',
  packaging: 'Упаковка',
  price: 'Цена',
  service: 'Сервис',
};

const EMOTION_LABELS: Record<string, string> = {
  joy: '😊',
  anger: '😡',
  disappointment: '😞',
  satisfaction: '😌',
  neutral: '😐',
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [category, setCategory] = useState('');
  const [customerClass, setCustomerClass] = useState('');
  const [marketplace, setMarketplace] = useState('');

  const limit = 15;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchReviews = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await api.getReviews({ search, sentiment, category, customerClass, marketplace, page, limit });
      if (signal?.aborted) return;
      setReviews(res.reviews);
      setTotal(res.total);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [search, sentiment, category, customerClass, marketplace, page]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchReviews(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchReviews]);

  async function handleAnalyze(id: string) {
    setAnalyzing(id);
    try {
      const updated = await api.analyzeReview(id);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setAnalyzing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить этот отзыв?')) return;
    setDeleting(id);
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => t - 1);
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Отзывы</h1>
          <p style={styles.subtitle}>{total} отзыв(ов) найдено</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Добавить
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            placeholder="Поиск по тексту, товару..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <select value={sentiment} onChange={(e) => { setSentiment(e.target.value); setPage(1); }}>
          <option value="">Все тональности</option>
          <option value="positive">Позитив</option>
          <option value="neutral">Нейтральный</option>
          <option value="negative">Негатив</option>
        </select>

        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">Все категории</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select value={customerClass} onChange={(e) => { setCustomerClass(e.target.value); setPage(1); }}>
          <option value="">Все клиенты</option>
          <option value="loyal">Лояльные</option>
          <option value="neutral">Нейтральные</option>
          <option value="problematic">Проблемные</option>
        </select>

        <select value={marketplace} onChange={(e) => { setMarketplace(e.target.value); setPage(1); }}>
          <option value="">Все маркетплейсы</option>
          <option value="Kaspi Магазин">Kaspi Магазин</option>
          <option value="Wildberries">Wildberries</option>
          <option value="Ozon">Ozon</option>
          <option value="SATU.kz">SATU.kz</option>
          <option value="Flip.kz">Flip.kz</option>
          <option value="Mechta.kz">Mechta.kz</option>
          <option value="Arbuz.kz">Arbuz.kz</option>
          <option value="Другой">Другой</option>
        </select>

        {(searchInput || sentiment || category || customerClass || marketplace) && (
          <button className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearch(''); setSentiment(''); setCategory(''); setCustomerClass(''); setMarketplace(''); setPage(1); }}>
            <X size={14} /> Сбросить
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: 'var(--muted)', padding: 40 }}>Загрузка...</div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
          Отзывы не найдены
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onAnalyze={() => handleAnalyze(r.id)}
              analyzing={analyzing === r.id}
              onDelete={() => handleDelete(r.id)}
              deleting={deleting === r.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button className="btn btn-ghost" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Страница {page} из {totalPages}</span>
          <button className="btn btn-ghost" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showForm && <AddReviewModal onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); fetchReviews(); }} />}
    </div>
  );
}

function ReviewCard({ review: r, onAnalyze, analyzing, onDelete, deleting }: {
  review: Review;
  onAnalyze: () => void;
  analyzing: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div className="review-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.reviewMeta}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{r.productName}</span>
            {r.marketplace && <span style={{ fontSize: 12, color: 'var(--accent)', background: 'rgba(99,102,241,0.12)', borderRadius: 6, padding: '2px 8px' }}>{r.marketplace}</span>}
            {r.customerName && <span style={{ color: 'var(--muted)', fontSize: 13 }}>— {r.customerName}</span>}
            <Stars rating={r.starRating} />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              {new Date(r.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
          <p style={styles.reviewText}>{r.reviewText}</p>
        </div>

        <div className="review-actions">
          <button className="btn btn-ghost" onClick={onAnalyze} disabled={analyzing} title="AI-анализ">
            {analyzing ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
          </button>
          <button className="btn btn-danger" onClick={onDelete} disabled={deleting} title="Удалить">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {r.aiSentiment && (
        <div style={styles.aiRow}>
          <span className={`badge badge-${r.aiSentiment}`}>
            {r.aiSentiment === 'positive' ? 'Позитив' : r.aiSentiment === 'negative' ? 'Негатив' : 'Нейтральный'}
          </span>
          {r.aiSentimentScore != null && (
            <span style={styles.score}>{r.aiSentimentScore}/100</span>
          )}
          {r.aiCategory && (
            <span className="badge badge-neutral">{CATEGORY_LABELS[r.aiCategory] || r.aiCategory}</span>
          )}
          {r.aiCustomerClass && (
            <span className={`badge badge-${r.aiCustomerClass === 'loyal' ? 'loyal' : r.aiCustomerClass === 'problematic' ? 'problematic' : 'neutral-cls'}`}>
              {r.aiCustomerClass === 'loyal' ? 'Лояльный' : r.aiCustomerClass === 'problematic' ? 'Проблемный' : 'Нейтральный'}
            </span>
          )}
          {r.aiEmotion && (
            <span title={r.aiEmotion} style={{ fontSize: 16 }}>{EMOTION_LABELS[r.aiEmotion] || '🫥'}</span>
          )}
          {r.aiComplaintSummary && (
            <span style={styles.complaint}>{r.aiComplaintSummary}</span>
          )}
        </div>
      )}

      {r.aiKeyPhrases && r.aiKeyPhrases.length > 0 && (
        <div style={styles.phrases}>
          {(r.aiKeyPhrases as string[]).map((p, i) => (
            <span key={i} style={styles.phrase}>{p}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={i < rating ? '#f59e0b' : 'none'} color={i < rating ? '#f59e0b' : 'var(--border)'} />
      ))}
    </span>
  );
}

function AddReviewModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ customerName: '', productName: '', marketplace: '', starRating: '5', reviewText: '', category: 'quality' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createReview({ ...form, starRating: parseInt(form.starRating) });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div className="card" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Добавить отзыв</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Имя клиента (необязательно)" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} style={{ width: '100%' }} />
          <input placeholder="Название товара *" value={form.productName} onChange={(e) => set('productName', e.target.value)} required style={{ width: '100%' }} />
          <select value={form.marketplace} onChange={(e) => set('marketplace', e.target.value)} style={{ width: '100%' }}>
            <option value="">Где куплено? (необязательно)</option>
            <option value="Kaspi Магазин">Kaspi Магазин</option>
            <option value="Wildberries">Wildberries</option>
            <option value="Ozon">Ozon</option>
            <option value="SATU.kz">SATU.kz</option>
            <option value="Flip.kz">Flip.kz</option>
            <option value="Mechta.kz">Mechta.kz</option>
            <option value="Arbuz.kz">Arbuz.kz</option>
            <option value="Другой">Другой</option>
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={form.starRating} onChange={(e) => set('starRating', e.target.value)} style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} style={{ flex: 1 }}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <textarea
            placeholder="Текст отзыва *"
            value={form.reviewText}
            onChange={(e) => set('reviewText', e.target.value)}
            required
            rows={4}
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 12px', resize: 'vertical', outline: 'none' }}
          />
          {error && <p style={{ color: 'var(--negative)', fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  subtitle: { color: 'var(--muted)', fontSize: 14 },
  reviewMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  reviewText: { fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 },
  aiRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  score: { fontSize: 12, color: 'var(--muted)', padding: '3px 8px', background: 'var(--surface2)', borderRadius: 6 },
  complaint: { fontSize: 12, color: 'var(--negative)', fontStyle: 'italic' },
  phrases: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  phrase: { fontSize: 12, color: 'var(--muted)', padding: '2px 8px', background: 'var(--surface2)', borderRadius: 6 },
  pagination: { display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginTop: 24 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { width: '100%', maxWidth: 480, padding: 28 },
};
