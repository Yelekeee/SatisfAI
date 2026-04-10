import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, MessageSquare, LogOut } from 'lucide-react';

export default function Layout() {
  const { manager, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function close() { setOpen(false); }

  return (
    <div className="layout-shell">
      {/* Mobile top bar */}
      <header className="layout-topbar">
        <div className="topbar-brand">
          <span>✦</span>
          <span>SatisfAI</span>
        </div>
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </header>

      {/* Overlay */}
      {open && <div className="layout-overlay" onClick={close} />}

      {/* Sidebar */}
      <aside className={`layout-sidebar${open ? ' open' : ''}`}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>✦</span>
          <span style={styles.brandText}>SatisfAI</span>
        </div>

        <nav style={styles.nav}>
          <NavLink to="/app" end style={navStyle} onClick={close}>
            <LayoutDashboard size={18} />
            Дашборд
          </NavLink>
          <NavLink to="/app/reviews" style={navStyle} onClick={close}>
            <MessageSquare size={18} />
            Отзывы
          </NavLink>
        </nav>

        <div style={styles.footer}>
          <p style={styles.managerName}>{manager?.name}</p>
          <p style={styles.managerEmail}>{manager?.email}</p>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
            <LogOut size={14} />
            Выйти
          </button>
        </div>
      </aside>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

function navStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? '#fff' : 'var(--muted)',
    background: isActive ? 'var(--accent)' : 'transparent',
    transition: 'all 0.15s',
  };
}

const styles: Record<string, React.CSSProperties> = {
  brand: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, paddingLeft: 4 },
  brandIcon: { fontSize: 20, color: 'var(--accent)' },
  brandText: { fontSize: 18, fontWeight: 700 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  footer: { borderTop: '1px solid var(--border)', paddingTop: 16 },
  managerName: { fontSize: 13, fontWeight: 600 },
  managerEmail: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
};
