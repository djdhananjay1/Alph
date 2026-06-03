import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bridge } from '../lib/bridge';

type Status = 'idle' | 'connecting' | 'connected' | 'error';

function getOsHint(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  return 'Linux';
}

function parseHash(): { token: string; port: number } | null {
  const raw = window.location.hash.replace('#', '');
  const p = new URLSearchParams(raw);
  const token = p.get('token');
  const port = parseInt(p.get('port') ?? '3421', 10);
  if (!token) return null;
  return { token, port };
}

export default function Connect() {
  const [status, setStatus]     = useState<Status>('idle');
  const [error, setError]       = useState('');
  const [connInfo, setConnInfo] = useState<{ version: string; platform: string; hostname: string } | null>(null);
  const [token, setToken]       = useState('');
  const [port, setPort]         = useState(3421);
  const nav = useNavigate();

  // Auto-connect if token is in the URL hash
  useEffect(() => {
    const params = parseHash();
    if (params) {
      setToken(params.token);
      setPort(params.port);
      doConnect(params.token, params.port);
    }
  }, []);

  const doConnect = async (t: string, p: number) => {
    setStatus('connecting');
    setError('');
    try {
      const info = await bridge.connect(t, p);
      setConnInfo(info);
      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  const goToDashboard = () => nav('/dashboard');

  const osHint = getOsHint();
  const cmd = 'npx @aqualia/alph-cli connect';

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Connect your machine</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 36 }}>
        The bridge runs on your machine and lets this page control Alph remotely.
      </p>

      {/* Step 1 */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ background: 'var(--primary)', borderRadius: '50%', width: 28, height: 28, display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</span>
          <h3 style={{ fontWeight: 600 }}>Start the bridge on your machine</h3>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 14 }}>
          Detected OS: <strong style={{ color: 'var(--text)' }}>{osHint}</strong>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#020208', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
          <code className="mono" style={{ flex: 1, color: 'var(--cyan)', fontSize: '0.9rem' }}>{cmd}</code>
          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            onClick={() => navigator.clipboard.writeText(cmd)}>
            Copy
          </button>
        </div>

        <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--muted)' }}>
          No Node.js? <a href="https://github.com/Aqualia/Alph/releases/latest" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Download the standalone binary</a> instead.
        </p>
      </div>

      {/* Step 2 */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ background: 'var(--primary)', borderRadius: '50%', width: 28, height: 28, display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>2</span>
          <h3 style={{ fontWeight: 600 }}>Connect this page to the bridge</h3>
        </div>

        {status === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Once the bridge is running, paste your token here or just click the link it printed.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" placeholder="Session token from terminal" value={token}
                onChange={e => setToken(e.target.value)} style={{ flex: 1 }} />
              <input className="input" value={port} type="number" onChange={e => setPort(+e.target.value)}
                style={{ width: 90 }} />
            </div>
            <button className="btn btn-primary" disabled={!token} onClick={() => doConnect(token, port)}>
              Connect
            </button>
          </div>
        )}

        {status === 'connecting' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)' }}>
            <div className="spinner" />
            Connecting to ws://127.0.0.1:{port}…
          </div>
        )}

        {status === 'error' && (
          <div>
            <p style={{ color: 'var(--danger)', marginBottom: 14, fontSize: '0.9rem' }}>⚠ {error}</p>
            <button className="btn btn-ghost" onClick={() => setStatus('idle')}>Try again</button>
          </div>
        )}

        {status === 'connected' && connInfo && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span className="dot dot-green pulse" />
              <span style={{ color: 'var(--success)', fontWeight: 500 }}>Bridge connected</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 2 }}>
              <div>Host: <span style={{ color: 'var(--text)' }}>{connInfo.hostname}</span></div>
              <div>Platform: <span style={{ color: 'var(--text)' }}>{connInfo.platform}</span></div>
              <div>Alph: <span style={{ color: 'var(--text)' }}>v{connInfo.version}</span></div>
            </div>
            <button className="btn btn-primary" onClick={goToDashboard} style={{ marginTop: 20 }}>
              Open Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
