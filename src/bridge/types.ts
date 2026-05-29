export type TransportType = 'http' | 'sse' | 'stdio';
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

// ── Browser → Bridge ──────────────────────────────────────────────────────────

export type IncomingMessage =
  | { type: 'ping' }
  | { type: 'detect_agents' }
  | { type: 'get_status'; payload?: { dir?: string } }
  | { type: 'get_history' }
  | { type: 'configure'; payload: ConfigurePayload }
  | { type: 'remove'; payload: RemovePayload };

export interface ConfigurePayload {
  mcpServerEndpoint: string;
  bearer?: string;
  transport?: TransportType;
  agents?: string;
  name?: string;
  dryRun?: boolean;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface RemovePayload {
  serverName: string;
  agents?: string;
  dryRun?: boolean;
}

// ── Bridge → Browser ──────────────────────────────────────────────────────────

export type OutgoingMessage =
  | { type: 'pong' }
  | { type: 'connected'; payload: ConnectedPayload }
  | { type: 'agents'; payload: AgentInfo[] }
  | { type: 'status'; payload: AgentInfo[] }
  | { type: 'history'; payload: HistoryEntry[] }
  | { type: 'log'; payload: LogEntry }
  | { type: 'configure_result'; payload: OperationResult }
  | { type: 'remove_result'; payload: OperationResult }
  | { type: 'error'; payload: { message: string } };

export interface ConnectedPayload {
  version: string;
  platform: string;
  hostname: string;
}

export interface AgentInfo {
  name: string;
  detected: boolean;
  configPath?: string;
  error?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
}

export interface OperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  action: 'configure' | 'remove' | 'detect';
  timestamp: string;
  agents?: string[];
  serverName?: string;
  success: boolean;
  error?: string;
}
