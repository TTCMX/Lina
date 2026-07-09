import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Fab from './Fab';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isAgendar = location.pathname === '/agendar';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--color-text)', position: 'relative' }}>
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      {!isAgendar && <Footer />}
      {!isAgendar && !menuOpen && <Fab />}
    </div>
  );
}
