import { useEffect, useState } from 'react';
import { bridge, type AgentInfo } from '../lib/bridge';

export default function StatusPage() {
  const [agents, setAgents]   = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setAgents(await bridge.getStatus()); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (bridge.connected) load(); else setLoading(false); }, []);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Agent status</h1>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↻'} Refresh
        </button>
      </div>

      {loading && <div className="spinner" />}

      {!loading && agents.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
          Bridge not connected or no agents found.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {agents.map(a => (
          <div key={a.name} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span className={`dot ${a.detected ? 'dot-green' : 'dot-red'}`} />
              <span style={{ fontWeight: 600 }}>{a.name}</span>
            </div>
            {a.detected && a.configPath && (
              <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', wordBreak: 'break-all', lineHeight: 1.6 }}>
                {a.configPath}
              </div>
            )}
            {!a.detected && (
              <div style={{ fontSize: '0.83rem', color: 'var(--muted)' }}>Not installed</div>
            )}
            {a.error && (
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: 8 }}>{a.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
