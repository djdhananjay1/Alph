import { Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

const AGENTS = ['Cursor', 'Claude Code', 'Gemini CLI', 'Windsurf', 'Kiro', 'Codex CLI'];

export default function Landing({ session }: { session: Session | null }) {
  return (
    <div className="page" style={{ textAlign: 'center' }}>
      {/* Hero */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>⬡</div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
          Configure MCP servers for<br />
          <span className="gradient-text">every AI agent at once.</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: 540, margin: '0 auto 36px' }}>
          Alph detects your installed AI agents, validates config changes,
          writes atomically with backups — all from your browser. Zero hand-editing.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {session ? (
            <Link to="/connect" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
                Get started free
              </Link>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '12px 28px' }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Supported agents */}
      <div style={{ marginBottom: 64 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          Works with
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {AGENTS.map(a => (
            <span key={a} style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              color: 'var(--muted)',
              background: 'var(--surface)'
            }}>{a}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign: 'left', marginBottom: 64 }}>
        {[
          { icon: '🔌', title: 'Run one command', body: 'Run "alph connect" or double-click the installer. The bridge starts on your machine.' },
          { icon: '🌐', title: 'Open the GUI', body: 'Your browser connects to the bridge automatically — no token copy-paste needed.' },
          { icon: '⚙️', title: 'Configure agents', body: 'Fill in your MCP endpoint. Alph writes configs atomically with backups across all agents.' },
          { icon: '✅', title: 'Done', body: 'Configs are live. Status dashboard shows every agent and every MCP server in one view.' },
        ].map(s => (
          <div key={s.title} className="card" style={{ padding: '24px 20px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{s.icon}</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{s.body}</p>
          </div>
        ))}
      </div>

      {/* Install snippet */}
      <div className="card" style={{ padding: 28, maxWidth: 540, margin: '0 auto', textAlign: 'left' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12 }}>No Node.js? Download the binary. Have Node.js?</p>
        <code className="mono" style={{ display: 'block', color: 'var(--cyan)', fontSize: '0.95rem' }}>
          npx @aqualia/alph-cli connect
        </code>
      </div>
    </div>
  );
}
