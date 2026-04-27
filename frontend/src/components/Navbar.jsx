import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, PlusCircle, LogOut, Sparkles, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── Theme State ─────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Apply theme to <html> on mount and on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Don't show navbar on login
  if (location.pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ListOrdered },
    { name: 'New Order', path: '/orders/new', icon: PlusCircle },
  ];

  return (
    <nav style={{
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            DryClean<span style={{ color: 'var(--accent-blue)' }}>Pro</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {links.map((link) => {
            const active = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
                color: active ? (theme === 'dark' ? '#fff' : 'var(--accent-blue)') : 'var(--text-secondary)',
                background: active ? (theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              }}>
                <Icon size={16} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {token && (
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: 'var(--accent-red)', background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <LogOut size={16} />
              <span className="desktop-nav">Logout</span>
            </button>
          )}
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn" style={{
            display: 'none', padding: 8, background: 'transparent', border: 'none',
            color: 'var(--text-primary)', cursor: 'pointer',
          }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--border-color)', padding: 12,
          display: 'flex', flexDirection: 'column', gap: 4,
        }} className="mobile-nav-dropdown">
          {links.map((link) => {
            const active = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
                color: active ? (theme === 'dark' ? '#fff' : 'var(--accent-blue)') : 'var(--text-secondary)',
                background: active ? (theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              }}>
                <Icon size={16} /> {link.name}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 640px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-nav-dropdown { display: none !important; }
        }
        @media (max-width: 639px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
