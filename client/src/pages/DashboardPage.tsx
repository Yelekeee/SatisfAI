import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, MessageSquare, Star, AlertTriangle } from 'lucide-react';
import { api } from '../api';
import type { Stats } from '../types';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

const CATEGORY_LABELS: Record<string, string> = {
  quality: 'Качество',
  delivery: 'Доставка',
  packaging: 'Упаковка',
  price: 'Цена',
  service: 'Сервис',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Загрузка...</div>;
  if (!stats) return null;

  const sentimentData = Object.entries(stats.sentimentCounts).map(([name, value]) => ({
    name: name === 'positive' ? 'Позитив' : name === 'negative' ? 'Негатив' : 'Нейтральный',
    value,
    key: name,
  }));

  const categoryData = Object.entries(stats.categoryCounts).map(([key, count]) => ({
    name: CATEGORY_LABELS[key] || key,
    count,
  })).sort((a, b) => b.count - a.count);

  const positiveRate = stats.total > 0
    ? Math.round(((stats.sentimentCounts.positive || 0) / stats.total) * 100)
    : 0;

  return (
    <div>
      <h1 style={styles.title}>Дашборд</h1>
      <p style={styles.subtitle}>Обзор отзывов клиентов</p>

      <div style={styles.statGrid} className="stat-grid">
        <StatCard
          icon={<MessageSquare size={20} />}
          label="Всего отзывов"
          value={stats.total}
          color="var(--accent)"
        />
        <StatCard
          icon={<Star size={20} />}
          label="Средний рейтинг"
          value={stats.avgRating ? stats.avgRating.toFixed(1) + ' / 5' : '—'}
          color="var(--neutral-color)"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Позитивных"
          value={`${positiveRate}%`}
          color="var(--positive)"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Негатив за 7 дней"
          value={stats.recentNegative}
          color="var(--negative)"
        />
      </div>

      <div style={styles.chartGrid} className="chart-grid">
        <div className="card" style={{ flex: 1, minWidth: 300 }}>
          <h3 style={styles.chartTitle}>Распределение тональности</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {sentimentData.map((entry) => (
                  <Cell key={entry.key} fill={SENTIMENT_COLORS[entry.key] || '#8b8fa8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'var(--muted)', fontSize: 13 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 2, minWidth: 340 }}>
          <h3 style={styles.chartTitle}>Отзывы по категориям</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 13 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                cursor={{ fill: 'rgba(108,99,255,0.08)' }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} name="Отзывы" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.recentNegative > 0 && (
        <div style={styles.alert}>
          <TrendingDown size={18} color="var(--negative)" />
          <span>
            За последние 7 дней поступило <strong>{stats.recentNegative}</strong> негативных отзыва(ов). Рекомендуем проверить.
          </span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="card" style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: color + '22', color }}>{icon}</div>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  subtitle: { color: 'var(--muted)', fontSize: 14, marginBottom: 28 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { display: 'flex', alignItems: 'center', gap: 16 },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { fontSize: 12, color: 'var(--muted)', marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: 700 },
  chartGrid: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
  chartTitle: { fontSize: 15, fontWeight: 600, marginBottom: 16 },
  alert: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 18px', borderRadius: 10,
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    fontSize: 14, color: 'var(--text)',
  },
};
