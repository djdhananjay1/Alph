import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function Nav({ session }: { session: Session | null }) {
  const nav = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    nav('/');
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo gradient-text" style={{ textDecoration: 'none' }}>
        ⬡ Alph
      </Link>

      <div className="nav-links">
        {session ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Dashboard</Link>
            <Link to="/connect"   className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Connect</Link>
            <Link to="/setup"     className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Setup</Link>
            <Link to="/status"    className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Status</Link>
            <button onClick={handleSignOut} className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost"   style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
