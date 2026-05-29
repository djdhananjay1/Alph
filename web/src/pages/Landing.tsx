import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';

// ── Animation variants ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const fadeIn  = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5 } }
};

// ── Data ─────────────────────────────────────────────────────────────────
const AGENTS = [
  { name: 'Cursor',      icon: '⌨️' },
  { name: 'Claude Code', icon: '🤖' },
  { name: 'Gemini CLI',  icon: '✨' },
  { name: 'Windsurf',    icon: '🏄' },
  { name: 'Kiro',        icon: '🎯' },
  { name: 'Codex CLI',   icon: '⚡' },
];

const FEATURES = [
  {
    icon: '🔍',
    title: 'Auto-Detection',
    desc: 'Alph scans your machine and finds every installed AI agent automatically — no config hunting.'
  },
  {
    icon: '⚡',
    title: 'One Command',
    desc: 'Run alph connect once. Every future change happens from your browser — no terminal needed again.'
  },
  {
    icon: '🛡️',
    title: 'Atomic Writes',
    desc: 'Every config change is validated, backed up, and written atomically. Auto-rollback if anything goes wrong.'
  },
  {
    icon: '🌐',
    title: 'Browser-Driven',
    desc: 'Full GUI in your browser. Detect agents, configure MCP servers, view status — all without touching files.'
  },
  {
    icon: '🔒',
    title: 'Local-First',
    desc: 'The bridge runs on your machine. Your secrets never leave your system. Zero cloud dependency for configs.'
  },
  {
    icon: '📊',
    title: 'Live Dashboard',
    desc: 'See every agent and every MCP server in one view. Stream real-time logs as changes are applied.'
  },
];

const STEPS = [
  { num: '01', title: 'Sign up',       desc: 'Create your free Alph account in seconds.' },
  { num: '02', title: 'Run the bridge', desc: 'One command or double-click a binary — no Node.js needed.' },
  { num: '03', title: 'Open the GUI',   desc: 'Browser connects automatically. Your agents appear instantly.' },
  { num: '04', title: 'Configure',      desc: 'Fill in your MCP endpoint. Alph handles the rest for every agent.' },
];

// ── Floating orb decoration ───────────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      pointerEvents: 'none',
      ...style
    }} />
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function Landing({ session }: { session: Session | null }) {
  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px' }}>
        <Orb style={{ width: 600, height: 600, top: '-15%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(124,58,237,0.12)' }} />
        <Orb style={{ width: 300, height: 300, top: '30%', left: '10%', background: 'rgba(59,130,246,0.08)' }} />
        <Orb style={{ width: 250, height: 250, top: '20%', right: '10%', background: 'rgba(34,211,238,0.06)' }} />

        <motion.div variants={stagger} initial="hidden" animate="show" style={{ maxWidth: 780, position: 'relative' }}>

          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span className="badge badge-purple">
              <span className="dot dot-purple pulse" />
              Universal MCP Manager
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>
            Configure every AI agent<br />
            <span className="gradient-text">from your browser.</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Alph detects your installed AI coding agents, validates configs,
            writes atomically with backups — all driven from a beautiful GUI.
            Zero hand-editing. Zero broken configs.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            {session ? (
              <Link to="/connect" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                  Get started free
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                  Sign in
                </Link>
              </>
            )}
          </motion.div>

          {/* Terminal preview */}
          <motion.div variants={fadeUp} className="card" style={{ padding: '16px 20px', display: 'inline-flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            </div>
            <code className="mono" style={{ color: 'var(--cyan)', fontSize: '0.9rem' }}>
              $ npx @aqualia/alph-cli connect
            </code>
            <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>— then everything else is in the browser</span>
          </motion.div>

        </motion.div>
      </section>

      <div className="divider" />

      {/* ── AGENTS ───────────────────────────────────────────── */}
      <section style={{ padding: '72px 28px', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.p variants={fadeIn} style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 28 }}>
            Works with every major AI coding agent
          </motion.p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {AGENTS.map((a, i) => (
              <motion.div key={a.name} variants={fadeUp} custom={i}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-2)' }}>
                <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                {a.name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: 16 }}>
              Everything you need,{' '}
              <span className="gradient-text">nothing you don't.</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
              Built for developers who want powerful tooling without the overhead.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} className="card" style={{ padding: '28px 26px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'grid', placeItems: 'center', fontSize: '1.3rem', marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', maxWidth: 960, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, marginBottom: 16 }}>
              Up and running in{' '}
              <span className="gradient-text-warm">under 2 minutes.</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.num} variants={fadeUp} custom={i}
                style={{ padding: '28px 24px', position: 'relative' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-l)', marginBottom: 14 }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--border)', fontSize: '1.2rem', display: 'none' }}>→</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '96px 28px', textAlign: 'center', position: 'relative' }}>
        <Orb style={{ width: 500, height: 500, bottom: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(124,58,237,0.1)' }} />

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, marginBottom: 20 }}>
            Stop editing configs.<br />
            <span className="gradient-text">Start building.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-2)', fontSize: '1.05rem', marginBottom: 40, lineHeight: 1.7 }}>
            Join developers who already use Alph to manage their MCP servers across every AI agent — from one place.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {session ? (
              <Link to="/connect" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                  Get started — it's free
                </Link>
                <a href="https://github.com/Aqualia/Alph" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                  View on GitHub
                </a>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>⬡ Alph</span>
        <div style={{ display: 'flex', gap: 24, fontSize: '0.83rem', color: 'var(--text-2)' }}>
          <a href="https://github.com/Aqualia/Alph" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
          <a href="https://www.npmjs.com/package/@aqualia/alph-cli" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>npm</a>
          <a href="https://github.com/Aqualia/Alph/issues" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>MIT License · Built by Aqualia</span>
      </footer>

    </div>
  );
}
