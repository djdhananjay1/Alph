import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';

// ── Animation helpers ──────────────────────────────────────────────────────
const ease = 'easeOut' as const;

const fadeUp   = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } };
const fadeLeft = { hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.55, ease } } };
const scaleIn  = { hidden: { opacity: 0, scale: 0.88 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } } };
const fadeIn   = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };
const stagger  = (delay = 0.1) => ({ show: { transition: { staggerChildren: delay } } });

// ── Data ──────────────────────────────────────────────────────────────────
const AGENTS = [
  { name: 'Cursor',      icon: '⌨️', color: 'rgba(59,130,246,0.15)'  },
  { name: 'Claude Code', icon: '🤖', color: 'rgba(245,158,11,0.15)'  },
  { name: 'Gemini CLI',  icon: '✨', color: 'rgba(34,211,238,0.15)'  },
  { name: 'Windsurf',    icon: '🏄', color: 'rgba(16,185,129,0.15)'  },
  { name: 'Kiro',        icon: '🎯', color: 'rgba(239,68,68,0.15)'   },
  { name: 'Codex CLI',   icon: '⚡', color: 'rgba(124,58,237,0.15)'  },
];

const FEATURES = [
  { icon: '🔍', title: 'Auto-Detection',  desc: 'Scans your machine and finds every installed AI agent automatically — no config hunting.' },
  { icon: '⚡', title: 'One Command',     desc: 'Run alph connect once. Every future change happens from your browser. No terminal again.' },
  { icon: '🛡️', title: 'Atomic Writes',  desc: 'Every change is validated, backed up, and written atomically. Auto-rollback on failure.' },
  { icon: '🌐', title: 'Browser-Driven', desc: 'Full GUI in your browser. Detect, configure, view status — without touching files.' },
  { icon: '🔒', title: 'Local-First',    desc: 'Bridge runs on your machine. Secrets never leave. Zero cloud dependency for configs.' },
  { icon: '📊', title: 'Live Logs',      desc: 'Real-time log stream as changes apply. See exactly what is written and where.' },
];

const STEPS = [
  {
    num: '01', icon: '👤', color: '#a78bfa',
    title: 'Create account',
    desc:  'Sign up free in seconds. No credit card. Instant access to the dashboard.',
    code:  null,
  },
  {
    num: '02', icon: '🔌', color: '#60a5fa',
    title: 'Start the bridge',
    desc:  'Run one command — or double-click the standalone binary if you have no Node.js.',
    code:  'npx @aqualia/alph-cli connect',
  },
  {
    num: '03', icon: '🌐', color: '#34d399',
    title: 'Browser connects',
    desc:  'The page auto-detects the bridge. Your installed agents appear in seconds.',
    code:  null,
  },
  {
    num: '04', icon: '⚙️', color: '#f472b6',
    title: 'Configure everything',
    desc:  'Paste your MCP endpoint, pick agents, hit Apply. Alph writes every config file safely.',
    code:  null,
  },
];

const DOCS = [
  { icon: '🚀', title: 'Getting Started',  desc: 'Install Alph and connect your first agent in under 2 minutes.',    href: 'https://github.com/Aqualia/Alph#readme' },
  { icon: '📖', title: 'User Guide',       desc: 'Advanced setups, STDIO tools, custom config dirs, recipes.',        href: 'https://github.com/Aqualia/Alph/blob/main/USER_GUIDE.md' },
  { icon: '🏗️', title: 'Architecture',    desc: 'Execution flows, module layout, and design decisions explained.',    href: 'https://github.com/Aqualia/Alph/blob/main/ARCHITECTURE.md' },
  { icon: '🔐', title: 'Security',         desc: 'Secret handling, atomic writes, backups, and rollback strategy.',    href: 'https://github.com/Aqualia/Alph/blob/main/SECURITY.md' },
  { icon: '🐛', title: 'Troubleshooting',  desc: 'Common issues, agent detection failures, STDIO quirks & fixes.',    href: 'https://github.com/Aqualia/Alph/blob/main/TROUBLESHOOTING.md' },
  { icon: '🤝', title: 'Contributing',     desc: 'How to add agents, open PRs, and follow project conventions.',      href: 'https://github.com/Aqualia/Alph/blob/main/CONTRIBUTING.md' },
];

// ── Decorative orb ────────────────────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0, ...style }} />;
}

// ── Glass card ────────────────────────────────────────────────────────────
function GlassCard({ children, style, hover = true }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: 'rgba(124,58,237,0.45)' } : {}}
      style={{
        background: 'rgba(8,8,28,0.55)',
        border: '1px solid rgba(124,58,237,0.18)',
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'box-shadow 0.25s',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p variants={fadeIn} style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary-l)', marginBottom: 16 }}>
      {children}
    </motion.p>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function Landing({ session }: { session: Session | null }) {
  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '94vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px' }}>
        <Orb style={{ width: 700, height: 700, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(124,58,237,0.10)' }} />
        <Orb style={{ width: 320, height: 320, top: '35%', left:  '5%', background: 'rgba(59,130,246,0.07)' }} />
        <Orb style={{ width: 280, height: 280, top: '25%', right: '5%', background: 'rgba(34,211,238,0.06)' }} />

        <motion.div variants={stagger(0.12)} initial="hidden" animate="show" style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>

          <motion.div variants={scaleIn} style={{ marginBottom: 28 }}>
            <span className="badge badge-purple">
              <span className="dot dot-purple pulse" />
              Universal MCP Server Manager
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.8rem, 6.5vw, 4.6rem)', fontWeight: 800, marginBottom: 26, lineHeight: 1.08 }}>
            Configure every AI agent<br />
            <span className="gradient-text">from your browser.</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', color: 'var(--text-2)', maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.75 }}>
            Alph auto-detects your AI coding agents, validates configs, and writes
            atomically with backups — all driven from a beautiful GUI.
            Zero hand-editing. Zero broken configs.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            {session ? (
              <Link to="/connect" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 34px' }}>Open Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 34px' }}>Get started free</Link>
                <Link to="/login"    className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>Sign in</Link>
              </>
            )}
          </motion.div>

          {/* Terminal chip */}
          <motion.div variants={scaleIn}>
            <GlassCard hover={false} style={{ padding: '14px 20px', display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <code className="mono" style={{ color: 'var(--cyan)', fontSize: '0.88rem' }}>$ npx @aqualia/alph-cli connect</code>
              <span style={{ color: 'var(--text-2)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>then everything is in the browser</span>
            </GlassCard>
          </motion.div>

        </motion.div>
      </section>

      <div className="divider" />

      {/* ── AGENT STRIP ───────────────────────────────────────────────── */}
      <section style={{ padding: '64px 28px', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.08)}>
          <SectionLabel>Works with every major AI coding agent</SectionLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {AGENTS.map(a => (
              <motion.div key={a.name} variants={scaleIn}
                whileHover={{ scale: 1.06, boxShadow: '0 0 18px rgba(124,58,237,0.25)' }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 18px', borderRadius: 12, border: '1px solid var(--border)', background: a.color, backdropFilter: 'blur(8px)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', cursor: 'default' }}>
                <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                {a.name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 28px', maxWidth: 1140, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.09)}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 68 }}>
            <SectionLabel>Features</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 18 }}>
              Everything you need,{' '}
              <span className="gradient-text">nothing you don't.</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Powerful tooling built for developers who hate friction.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}>
                <GlassCard style={{ padding: '30px 28px', height: '100%' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(124,58,237,0.25)', display: 'grid', placeItems: 'center', fontSize: '1.4rem', marginBottom: 20 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.72 }}>{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 28px', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <Orb style={{ width: 400, height: 400, top: '10%', right: '-10%', background: 'rgba(59,130,246,0.07)' }} />

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.12)}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
            <SectionLabel>How it works</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
              Up and running in{' '}
              <span className="gradient-text-warm">under 2 minutes.</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem' }}>Four steps. The last three happen from your browser.</p>
          </motion.div>

          {/* Steps — vertical timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.num} variants={fadeLeft}
                style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 0, alignItems: 'stretch' }}>

                {/* Left: number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <motion.div
                    whileInView={{ scale: [0.6, 1.12, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${s.color}33, ${s.color}66)`, border: `1.5px solid ${s.color}88`, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '1.2rem', boxShadow: `0 0 18px ${s.color}44` }}>
                    {s.icon}
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.12 + 0.3 }}
                      style={{ width: 2, flex: 1, minHeight: 40, background: `linear-gradient(to bottom, ${s.color}66, transparent)`, transformOrigin: 'top', marginTop: 6 }}
                    />
                  )}
                </div>

                {/* Right: glass card */}
                <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0, paddingLeft: 20 }}>
                  <GlassCard style={{ padding: '24px 26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: s.color, textTransform: 'uppercase' }}>
                        Step {s.num}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: s.code ? 14 : 0 }}>{s.desc}</p>
                    {s.code && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(2,2,12,0.8)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginTop: 4 }}>
                        <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>$</span>
                        <code className="mono" style={{ color: 'var(--cyan)', fontSize: '0.85rem', flex: 1 }}>{s.code}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(s.code!)}
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 6, padding: '3px 10px', color: 'var(--primary-l)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Copy
                        </button>
                      </div>
                    )}
                  </GlassCard>
                </div>

              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── DOCUMENTATION ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 28px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger(0.08)}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionLabel>Documentation</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 16 }}>
              Everything is{' '}
              <span className="gradient-text">documented.</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
              From first install to advanced STDIO setups — we've written it all down.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {DOCS.map((d, i) => (
              <motion.div key={d.title} variants={fadeUp} custom={i}>
                <motion.a
                  href={d.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -4 }}
                  style={{ display: 'block', textDecoration: 'none', height: '100%' }}
                >
                  <GlassCard hover={false} style={{ padding: '26px 24px', height: '100%', cursor: 'pointer', transition: 'all 0.25s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'grid', placeItems: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        {d.icon}
                      </div>
                      <span style={{ fontSize: '1rem', color: 'var(--text-2)', marginTop: 2 }}>↗</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{d.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.68 }}>{d.desc}</p>
                  </GlassCard>
                </motion.a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="divider" />

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 28px', textAlign: 'center', position: 'relative' }}>
        <Orb style={{ width: 600, height: 400, bottom: '-10%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(124,58,237,0.09)' }} />

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.12)} style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div variants={scaleIn} style={{ marginBottom: 24 }}>
            <span className="badge badge-purple">
              <span className="dot dot-purple" />
              Free · Open Source · MIT
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 20 }}>
            Stop editing configs.<br />
            <span className="gradient-text">Start building.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-2)', fontSize: '1.05rem', marginBottom: 44, lineHeight: 1.75 }}>
            Alph is free, open source, and takes 2 minutes to set up.
            Manage every MCP server across every AI agent from one place.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {session ? (
              <Link to="/connect" className="btn btn-primary" style={{ fontSize: '1rem', padding: '15px 38px' }}>Open Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '15px 38px' }}>Get started free</Link>
                <a href="https://github.com/Aqualia/Alph" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '15px 28px' }}>
                  ★ Star on GitHub
                </a>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.15rem' }}>⬡ Alph</span>
        <div style={{ display: 'flex', gap: 28, fontSize: '0.83rem' }}>
          {[
            { label: 'GitHub', href: 'https://github.com/Aqualia/Alph' },
            { label: 'npm',    href: 'https://www.npmjs.com/package/@aqualia/alph-cli' },
            { label: 'Issues', href: 'https://github.com/Aqualia/Alph/issues' },
            { label: 'Changelog', href: 'https://github.com/Aqualia/Alph/blob/main/CHANGELOG.md' },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
              style={{ color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--text-2)')}>
              {l.label}
            </a>
          ))}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>MIT · Built by Aqualia</span>
      </footer>

    </div>
  );
}
