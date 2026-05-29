import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../lib/supabase';

export default function Register() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await signUp(email, password);
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
  };

  if (done) return (
    <div className="page-sm" style={{ textAlign: 'center' }}>
      <div className="card" style={{ padding: 36 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📬</div>
        <h2 style={{ marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24 }}>
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account, then come back to sign in.
        </p>
        <button className="btn btn-ghost" onClick={() => nav('/login')} style={{ width: '100%', justifyContent: 'center' }}>
          Go to login
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-sm">
      <div className="card" style={{ padding: 36 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>Create account</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: '0.9rem' }}>
          Free. No credit card needed.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
