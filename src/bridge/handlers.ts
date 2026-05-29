import { IncomingMessage, OutgoingMessage, LogEntry, AgentInfo } from './types';
import { defaultRegistry } from '../agents/registry';
import { executeConfigureCommand } from '../commands/configure';
import { executeRemoveCommand } from '../commands/remove';
import { logActivity, getHistory } from './db';

type SendFn = (msg: OutgoingMessage) => void;

// ── ANSI stripper ─────────────────────────────────────────────────────────────
const ANSI_RE = /\x1b\[[0-9;]*m/g;
function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, '');
}

// ── Console capture ───────────────────────────────────────────────────────────
function captureConsole(send: SendFn) {
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  const emit = (level: LogEntry['level']) =>
    (...args: unknown[]) => {
      const raw = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      const message = stripAnsi(raw).trim();
      if (message) {
        send({ type: 'log', payload: { level, message, timestamp: new Date().toISOString() } });
      }
    };

  console.log = emit('info') as typeof console.log;
  console.warn = emit('warn') as typeof console.warn;
  console.error = emit('error') as typeof console.error;

  return {
    restore() {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    }
  };
}

// ── Router ────────────────────────────────────────────────────────────────────
export async function handleMessage(msg: IncomingMessage, send: SendFn): Promise<void> {
  switch (msg.type) {
    case 'ping':
      send({ type: 'pong' });
      break;

    case 'detect_agents':
      await handleDetect(send);
      break;

    case 'get_status':
      await handleStatus(msg.payload?.dir, send);
      break;

    case 'get_history':
      send({ type: 'history', payload: getHistory() });
      break;

    case 'configure':
      await handleConfigure(msg.payload, send);
      break;

    case 'remove':
      await handleRemove(msg.payload, send);
      break;

    default:
      send({ type: 'error', payload: { message: 'Unknown message type' } });
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────
async function handleDetect(send: SendFn): Promise<void> {
  try {
    const results = await defaultRegistry.detectAvailableAgents();
    const agents: AgentInfo[] = results.map(r => ({
      name: r.provider.name,
      detected: r.detected,
      ...(r.configPath ? { configPath: r.configPath } : {}),
      ...(r.error ? { error: r.error } : {})
    }));
    send({ type: 'agents', payload: agents });
    logActivity({ action: 'detect', success: true });
  } catch (err) {
    send({ type: 'error', payload: { message: String(err) } });
    logActivity({ action: 'detect', success: false, error: String(err) });
  }
}

async function handleStatus(dir: string | undefined, send: SendFn): Promise<void> {
  try {
    const results = await defaultRegistry.detectAvailableAgents(undefined, dir);
    const agents: AgentInfo[] = results.map(r => ({
      name: r.provider.name,
      detected: r.detected,
      ...(r.configPath ? { configPath: r.configPath } : {}),
      ...(r.error ? { error: r.error } : {})
    }));
    send({ type: 'status', payload: agents });
  } catch (err) {
    send({ type: 'error', payload: { message: String(err) } });
  }
}

async function handleConfigure(payload: any, send: SendFn): Promise<void> {
  const cap = captureConsole(send);
  try {
    await executeConfigureCommand({
      mcpServerEndpoint: payload.mcpServerEndpoint,
      ...(payload.bearer !== undefined && { bearer: payload.bearer }),
      transport: payload.transport || 'http',
      ...(payload.agents !== undefined && { agents: payload.agents }),
      ...(payload.name !== undefined && { name: payload.name }),
      dryRun: !!payload.dryRun,
      yes: true,
      quiet: true,
      ...(payload.command !== undefined && { command: payload.command }),
      ...(payload.args !== undefined && { args: payload.args }),
      ...(payload.env !== undefined && { env: payload.env }),
      ...(payload.headers !== undefined && { headers: payload.headers })
    });

    logActivity({
      action: 'configure',
      agents: payload.agents ? String(payload.agents).split(',') : [],
      serverName: payload.name || payload.mcpServerEndpoint,
      success: true
    });
    send({ type: 'configure_result', payload: { success: true, message: 'Configuration applied' } });
  } catch (err) {
    logActivity({
      action: 'configure',
      agents: payload.agents ? String(payload.agents).split(',') : [],
      serverName: payload.name || payload.mcpServerEndpoint,
      success: false,
      error: String(err)
    });
    send({ type: 'configure_result', payload: { success: false, error: String(err) } });
  } finally {
    cap.restore();
  }
}

async function handleRemove(payload: any, send: SendFn): Promise<void> {
  const cap = captureConsole(send);
  try {
    await executeRemoveCommand({
      serverName: payload.serverName,
      ...(payload.agents !== undefined && { agents: payload.agents }),
      dryRun: !!payload.dryRun,
      yes: true
    });

    logActivity({
      action: 'remove',
      agents: payload.agents ? String(payload.agents).split(',') : [],
      serverName: payload.serverName,
      success: true
    });
    send({ type: 'remove_result', payload: { success: true, message: 'Server removed' } });
  } catch (err) {
    logActivity({
      action: 'remove',
      serverName: payload.serverName,
      success: false,
      error: String(err)
    });
    send({ type: 'remove_result', payload: { success: false, error: String(err) } });
  } finally {
    cap.restore();
  }
}
