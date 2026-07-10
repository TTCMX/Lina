import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function Admin() {
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((r) => r.json())
      .then((data) => setAuthenticated(!!data.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Cargando...
      </div>
    );
  }

  return authenticated
    ? <AdminDashboard onLoggedOut={() => setAuthenticated(false)} />
    : <AdminLogin onLoggedIn={() => setAuthenticated(true)} />;
}
