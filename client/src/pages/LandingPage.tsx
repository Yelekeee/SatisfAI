import { useNavigate } from 'react-router-dom';
import { BarChart2, Brain, MessageSquare, ShieldCheck, LogIn, Star } from 'lucide-react';

const features = [
  {
    icon: <Brain size={22} />,
    title: 'AI-талдау',
    desc: 'AI analytics әр пікірдің тонын, эмоциясын және санатын автоматты түрде анықтайды.',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Статистика',
    desc: 'Графиктер арқылы тон бөлінісі, санаттар және орташа рейтинг көрсетіледі.',
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'Пікірлер',
    desc: 'Барлық пікірлер бір жерде — тон, санат және клиент түрі бойынша сүзгілермен.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Қауіпсіздік',
    desc: 'Менеджерлер үшін JWT аутентификациясы. Клиенттер пікірлерін анонимді қалдырады.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.logoRow}>
          <span style={s.logoIcon}>✦</span>
          <span style={s.logoText}>SatisfAI</span>
        </div>
        <h1 style={s.heroTitle}>
          Тұтынушы пікірлерін<br />
          <span style={{ color: 'var(--accent)' }}>AI арқылы талдаңыз</span>
        </h1>
        <p style={s.heroSub}>
          Тұтынушы пікірлерін жинау және талдау үшін ақылды платформа.<br />
          AI тонды, эмоцияларды және негізгі мәселелерді автоматты анықтайды.
        </p>
      </section>

      {/* Features */}
      <section style={s.features}>
        {features.map((f, i) => (
          <div key={i} className="card" style={s.featureCard}>
            <div style={s.featureIcon}>{f.icon}</div>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Two options */}
      <section style={s.options}>
        {/* Manager login */}
        <div className="card" style={s.optionCard}>
          <div style={{ ...s.optionIconWrap, background: 'rgba(108,99,255,0.12)', color: 'var(--accent)' }}>
            <LogIn size={28} />
          </div>
          <h2 style={s.optionTitle}>Менеджер</h2>
          <p style={s.optionDesc}>
            Пікірлерді, статистиканы және AI-талдауды қарау үшін басқару панеліне кіріңіз.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            onClick={() => navigate('/login')}
          >
            Жүйеге кіру
          </button>
        </div>

        {/* Customer feedback */}
        <div className="card" style={s.optionCard}>
          <div style={{ ...s.optionIconWrap, background: 'rgba(34,197,94,0.12)', color: 'var(--positive)' }}>
            <Star size={28} />
          </div>
          <h2 style={s.optionTitle}>Клиент</h2>
          <p style={s.optionDesc}>
            Пікіріңізді қалдырыңыз және қызмет сапасын жақсартуға көмектесіңіз.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            onClick={() => navigate('/feedback')}
          >
            Пікір қалдыру
          </button>
        </div>
      </section>

      <footer style={s.footer}>
        <span>© 2026 SatisfAI — </span>
        <span style={{ color: 'var(--muted)' }}>ISLAM жасады</span>
      </footer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 32px', maxWidth: 900, margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: 48 },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 },
  logoIcon: { fontSize: 32, color: 'var(--accent)' },
  logoText: { fontSize: 32, fontWeight: 800, letterSpacing: '-1px' },
  heroTitle: { fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' },
  heroSub: { fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, width: '100%', marginBottom: 48 },
  featureCard: { padding: '20px 18px' },
  featureIcon: { width: 40, height: 40, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--accent)' },
  featureTitle: { fontSize: 14, fontWeight: 600, marginBottom: 8 },
  featureDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 },
  options: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, width: '100%', marginBottom: 48 },
  optionCard: { padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  optionIconWrap: { width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  optionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  optionDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 },
  footer: { fontSize: 13, color: 'var(--muted)', marginTop: 'auto', paddingTop: 24 },
};
