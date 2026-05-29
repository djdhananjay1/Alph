import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bridge, type AgentInfo } from '../lib/bridge';

export default function Dashboard() {
  const [agents, setAgents]     = useState<AgentInfo[]>([]);
  const [loading, setLoading]   = useState(false);
  const [connected, setConnected] = useState(bridge.connected);

  useEffect(() => {
    setConnected(bridge.connected);
    if (bridge.connected) loadAgents();
    const off = bridge.on('disconnected', () => setConnected(false));
    return () => off();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const result = await bridge.detectAgents();
      setAgents(result);
    } finally {
      setLoading(false);
    }
  };

  const detected = agents.filter(a => a.detected);

  if (!connected) return (
    <div className="page" style={{ textAlign: 'center', maxWidth: 480 }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔌</div>
      <h2 style={{ marginBottom: 10 }}>Bridge not connected</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: '0.9rem' }}>
        Run <code className="mono">alph connect</code> on your machine first.
      </p>
      <Link to="/connect" className="btn btn-primary">Connect now</Link>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.875rem' }}>
            <span className="dot dot-green" />
            Bridge connected
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={loadAgents} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↻'} Refresh
          </button>
          <Link to="/setup" className="btn btn-primary">+ Configure agents</Link>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { icon: '⚙️', label: 'Setup wizard', desc: 'Add a new MCP server', to: '/setup' },
          { icon: '📊', label: 'Status',       desc: 'View current configs',  to: '/status' },
          { icon: '🗑️', label: 'Remove',       desc: 'Remove an MCP server',  to: '/remove' },
        ].map(a => (
          <Link key={a.label} to={a.to} className="card" style={{ padding: '20px 18px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.label}</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--muted)' }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* Detected agents */}
      {agents.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>
            Detected agents ({detected.length}/{agents.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {agents.map(a => (
              <div key={a.name} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span className={`dot ${a.detected ? 'dot-green' : 'dot-red'}`} style={{ marginTop: 6 }} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{a.name}</div>
                  {a.detected && a.configPath && (
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', wordBreak: 'break-all' }}>
                      {a.configPath}
                    </div>
                  )}
                  {!a.detected && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Not installed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {agents.length === 0 && !loading && (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ marginBottom: 16 }}>No agent data yet.</p>
          <button className="btn btn-primary" onClick={loadAgents}>Detect agents</button>
        </div>
      )}
    </div>
  );
}
