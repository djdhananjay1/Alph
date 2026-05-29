import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function Nav({ session }: { session: Session | null }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    nav('/');
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      style={{
        padding: '7px 14px',
        borderRadius: 8,
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        color: pathname === to ? 'var(--text)' : 'var(--text-2)',
        background: pathname === to ? 'rgba(124,58,237,0.1)' : 'transparent',
        border: pathname === to ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo gradient-text">
        ⬡ Alph
      </Link>

      <div className="nav-links">
        {session ? (
          <>
            {navLink('/dashboard', 'Dashboard')}
            {navLink('/connect',   'Connect')}
            {navLink('/setup',     'Setup')}
            {navLink('/status',    'Status')}
            <button
              onClick={handleSignOut}
              className="btn btn-ghost"
              style={{ padding: '7px 14px', fontSize: '0.875rem', marginLeft: 4 }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: '0.875rem' }}>
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
