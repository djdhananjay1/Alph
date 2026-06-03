import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bridge, type AgentInfo, type LogEntry } from '../lib/bridge';
import { useBridge } from '../lib/useBridge';

type Transport = 'http' | 'sse' | 'stdio';
type Step = 'agents' | 'server' | 'preview' | 'applying' | 'done';

export default function Setup() {
  const [step, setStep]         = useState<Step>('agents');
  const [agents, setAgents]     = useState<AgentInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  const [endpoint, setEndpoint] = useState('');
  const [bearer, setBearer]     = useState('');
  const [transport, setTransport] = useState<Transport>('http');
  const [name, setName]         = useState('');
  const [dryRun, setDryRun]     = useState(false);

  const [logs, setLogs]   = useState<LogEntry[]>([]);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const { connected, reconnecting } = useBridge();

  useEffect(() => {
    if (!connected) return;
    bridge.detectAgents().then(a => {
      setAgents(a);
      setSelected(a.filter(x => x.detected).map(x => x.name));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [connected]);

  const toggle = (name: string) =>
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);

  const apply = async () => {
    setStep('applying');
    setLogs([]);
    setResult(null);

    const res = await bridge.configure(
      {
        mcpServerEndpoint: endpoint,
        bearer: bearer || undefined,
        transport,
        agents: selected.join(','),
        name: name || undefined,
        dryRun
      },
      (entry) => setLogs(l => [...l, entry])
    );

    setResult(res);
    setStep('done');
  };

  if (reconnecting) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Reconnecting to bridge…</p>
    </div>
  );

  if (!connected) return (
    <div className="page" style={{ textAlign: 'center', maxWidth: 480 }}>
      <p style={{ color: 'var(--text-2)' }}>Bridge not connected. <Link to="/connect" style={{ color: 'var(--primary)' }}>Connect first</Link>.</p>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Setup wizard</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 36 }}>Configure an MCP server across your AI agents.</p>

      {/* Step: agents */}
      {(step === 'agents' || step === 'server' || step === 'preview') && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>1. Select agents</h3>
          {loading ? <div className="spinner" /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {agents.map(a => (
                <button
                  key={a.name}
                  className={`agent-pill ${selected.includes(a.name) ? 'selected' : ''} ${!a.detected ? 'disabled' : ''}`}
                  onClick={() => a.detected && toggle(a.name)}
                >
                  <span className={`dot ${a.detected ? 'dot-green' : 'dot-red'}`} />
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: server details */}
      {(step === 'server' || step === 'preview') && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>2. MCP server details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label>MCP Server Endpoint *</label>
              <input className="input" placeholder="https://your-server.com/mcp" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
            </div>
            <div>
              <label>Bearer Token (optional)</label>
              <input className="input" type="password" placeholder="sk-..." value={bearer} onChange={e => setBearer(e.target.value)} />
            </div>
            <div>
              <label>Transport</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['http', 'sse', 'stdio'] as Transport[]).map(t => (
                  <button key={t} className={`agent-pill ${transport === t ? 'selected' : ''}`} onClick={() => setTransport(t)}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Server name (optional)</label>
              <input className="input" placeholder="my-mcp-server" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', cursor: 'pointer' }}>
              <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
              Dry run (preview only — no files written)
            </label>
          </div>
        </div>
      )}

      {/* Step: preview */}
      {step === 'preview' && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>3. Preview</h3>
          <div style={{ fontSize: '0.875rem', lineHeight: 2, color: 'var(--muted)' }}>
            <div>Agents: <span style={{ color: 'var(--text)' }}>{selected.join(', ') || 'none'}</span></div>
            <div>Endpoint: <span className="mono" style={{ color: 'var(--cyan)' }}>{endpoint}</span></div>
            <div>Transport: <span style={{ color: 'var(--text)' }}>{transport}</span></div>
            <div>Auth: <span style={{ color: 'var(--text)' }}>{bearer ? '●●●●●●' : 'none'}</span></div>
            {name && <div>Name: <span style={{ color: 'var(--text)' }}>{name}</span></div>}
            {dryRun && <div style={{ color: 'var(--warn)' }}>⚠ Dry run — no files will be written</div>}
          </div>
        </div>
      )}

      {/* Applying */}
      {step === 'applying' && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="spinner" />
            <span>Configuring agents…</span>
          </div>
          {logs.length > 0 && (
            <div className="log-panel">
              {logs.map((l, i) => (
                <div key={i} className={`log-${l.level}`}>
                  <span style={{ opacity: 0.5 }}>{new Date(l.timestamp).toLocaleTimeString()} </span>
                  {l.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Done */}
      {step === 'done' && result && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span className={`dot ${result.success ? 'dot-green' : 'dot-red'}`} />
            <span style={{ fontWeight: 600, color: result.success ? 'var(--success)' : 'var(--danger)' }}>
              {result.success ? (dryRun ? 'Dry run complete' : 'Configuration applied!') : 'Failed'}
            </span>
          </div>
          {result.error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 12 }}>{result.error}</p>}
          {logs.length > 0 && (
            <div className="log-panel" style={{ marginBottom: 16 }}>
              {logs.map((l, i) => (
                <div key={i} className={`log-${l.level}`}>{l.message}</div>
              ))}
            </div>
          )}
          <button className="btn btn-ghost" onClick={() => { setStep('agents'); setResult(null); setLogs([]); }}>
            Configure another
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {step === 'agents' && (
          <button className="btn btn-primary" disabled={selected.length === 0} onClick={() => setStep('server')}>
            Next: Server details →
          </button>
        )}
        {step === 'server' && (
          <>
            <button className="btn btn-ghost" onClick={() => setStep('agents')}>← Back</button>
            <button className="btn btn-primary" disabled={!endpoint} onClick={() => setStep('preview')}>
              Preview →
            </button>
          </>
        )}
        {step === 'preview' && (
          <>
            <button className="btn btn-ghost" onClick={() => setStep('server')}>← Back</button>
            <button className="btn btn-primary" onClick={apply}>
              {dryRun ? 'Run dry run' : 'Apply configuration'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
