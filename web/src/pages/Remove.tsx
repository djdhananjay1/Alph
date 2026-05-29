import { useEffect, useState } from 'react';
import { bridge, type AgentInfo, type LogEntry } from '../lib/bridge';

export default function Remove() {
  const [agents, setAgents]     = useState<AgentInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [serverName, setServerName] = useState('');
  const [dryRun, setDryRun]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [logs, setLogs]         = useState<LogEntry[]>([]);
  const [result, setResult]     = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    if (bridge.connected) {
      bridge.detectAgents().then(a => {
        setAgents(a.filter(x => x.detected));
        setLoading(false);
      });
    } else setLoading(false);
  }, []);

  const toggle = (name: string) =>
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);

  const apply = async () => {
    setApplying(true);
    setLogs([]);
    setResult(null);
    const res = await bridge.remove(
      { serverName, agents: selected.join(',') || undefined, dryRun },
      (e) => setLogs(l => [...l, e])
    );
    setResult(res);
    setApplying(false);
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Remove MCP server</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 36 }}>
        Remove an MCP server configuration from one or more agents.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label>MCP server name *</label>
            <input className="input" placeholder="my-mcp-server" value={serverName} onChange={e => setServerName(e.target.value)} />
          </div>

          <div>
            <label>Filter agents (optional — leave all selected for all)</label>
            {loading ? <div className="spinner" /> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                {agents.map(a => (
                  <button key={a.name}
                    className={`agent-pill ${selected.includes(a.name) ? 'selected' : ''}`}
                    onClick={() => toggle(a.name)}>
                    <span className="dot dot-green" />
                    {a.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', cursor: 'pointer' }}>
            <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
            Dry run (preview only — no changes made)
          </label>
        </div>
      </div>

      {result && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className={`dot ${result.success ? 'dot-green' : 'dot-red'}`} />
            <span style={{ fontWeight: 600, color: result.success ? 'var(--success)' : 'var(--danger)' }}>
              {result.success ? 'Done' : 'Failed'}
            </span>
          </div>
          {result.error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{result.error}</p>}
          {logs.length > 0 && (
            <div className="log-panel" style={{ marginTop: 12 }}>
              {logs.map((l, i) => <div key={i} className={`log-${l.level}`}>{l.message}</div>)}
            </div>
          )}
        </div>
      )}

      {applying && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="spinner" /> Removing…
          </div>
          {logs.length > 0 && (
            <div className="log-panel">
              {logs.map((l, i) => <div key={i} className={`log-${l.level}`}>{l.message}</div>)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-danger" disabled={!serverName || applying} onClick={apply}>
          {dryRun ? 'Preview removal' : 'Remove server'}
        </button>
      </div>
    </div>
  );
}
