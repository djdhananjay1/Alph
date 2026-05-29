import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../lib/supabase';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) { setError(err.message); setLoading(false); return; }
    nav('/connect');
  };

  return (
    <div className="page-sm">
      <div className="card" style={{ padding: 36 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: '0.9rem' }}>
          Sign in to your Alph account
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
