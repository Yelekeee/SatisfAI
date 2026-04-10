import { useState, type FormEvent } from 'react';
import { api } from '../api';

const CATEGORIES = [
  { value: 'quality', label: 'Сапа / Качество' },
  { value: 'delivery', label: 'Жеткізу / Доставка' },
  { value: 'packaging', label: 'Қаптама / Упаковка' },
  { value: 'service', label: 'Қызмет / Сервис' },
  { value: 'price', label: 'Баға / Цена' },
];

export default function FeedbackPage() {
  const [form, setForm] = useState({
    customerName: '',
    productName: '',
    marketplace: '',
    starRating: 5,
    reviewText: '',
    category: 'quality',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.submitFeedback({ ...form, starRating: Number(form.starRating) });
      setDone(true);
    } catch {
      setError('Жіберу қатесі / Ошибка отправки');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.box} className="card">
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <h2 style={{ marginBottom: 8 }}>Рахмет! / Спасибо!</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              Пікіріңіз қабылданды / Ваш отзыв принят
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 24, justifyContent: 'center' }}
              onClick={() => { setDone(false); setForm({ customerName: '', productName: '', marketplace: '', starRating: 5, reviewText: '', category: 'quality' }); }}
            >
              Жаңа пікір / Новый отзыв
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.box} className="card">
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          <span style={styles.logoText}>SatisfAI</span>
        </div>
        <p style={styles.subtitle}>Пікір қалдыру / Оставить отзыв</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Атыңыз / Ваше имя (міндетті емес / необязательно)</label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => set('customerName', e.target.value)}
            placeholder="Аты-жөні / Имя"
            style={styles.input}
          />

          <label style={styles.label}>Өнім атауы / Название товара *</label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => set('productName', e.target.value)}
            required
            placeholder="Мысалы: Samsung Galaxy S24"
            style={styles.input}
          />

          <label style={styles.label}>Қайдан сатып алдыңыз? / Где купили? (міндетті емес / необязательно)</label>
          <select
            value={form.marketplace}
            onChange={(e) => set('marketplace', e.target.value)}
            style={styles.input}
          >
            <option value="">Таңдаңыз / Выберите маркетплейс</option>
            <option value="Kaspi Магазин">Kaspi Магазин</option>
            <option value="Wildberries">Wildberries</option>
            <option value="Ozon">Ozon</option>
            <option value="SATU.kz">SATU.kz</option>
            <option value="Flip.kz">Flip.kz</option>
            <option value="Mechta.kz">Mechta.kz</option>
            <option value="Arbuz.kz">Arbuz.kz</option>
            <option value="Другой / Басқа">Другой / Басқа</option>
          </select>

          <label style={styles.label}>Баға / Оценка *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => set('starRating', star)}
                style={{
                  fontSize: 28,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: star <= form.starRating ? '#f59e0b' : 'var(--border)',
                  padding: '0 2px',
                }}
              >
                ★
              </button>
            ))}
          </div>

          <label style={styles.label}>Санат / Категория *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            required
            style={styles.input}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <label style={styles.label}>Пікір / Отзыв *</label>
          <textarea
            value={form.reviewText}
            onChange={(e) => set('reviewText', e.target.value)}
            required
            rows={4}
            placeholder="Өніміңіз туралы пікіріңізді жазыңыз... / Напишите ваш отзыв о товаре..."
            style={{ ...styles.input, resize: 'vertical' }}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Жіберілуде... / Отправка...' : 'Жіберу / Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  box: { width: '100%', maxWidth: 420, padding: 36 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoIcon: { fontSize: 24, color: 'var(--accent)' },
  logoText: { fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' },
  subtitle: { color: 'var(--muted)', fontSize: 13, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 13, color: 'var(--muted)', marginBottom: 2 },
  input: { width: '100%' },
  error: { color: 'var(--negative)', fontSize: 13, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 },
};
