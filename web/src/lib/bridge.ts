type MsgHandler = (payload: any) => void;

export type AgentInfo = {
  name: string;
  detected: boolean;
  configPath?: string;
  error?: string;
};

export type LogEntry = {
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: string;
};

export type OperationResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export type ConnectedInfo = {
  version: string;
  platform: string;
  hostname: string;
};

class BridgeClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, MsgHandler[]>();
  private _connected = false;

  get connected() {
    return this._connected;
  }

  connect(token: string, port = 3421): Promise<ConnectedInfo> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}?token=${token}`);
      this.ws = ws;

      ws.onopen = () => {};

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'connected') {
          this._connected = true;
          resolve(msg.payload as ConnectedInfo);
        }
        this.emit(msg.type, msg.payload);
      };

      ws.onerror = () => {
        this._connected = false;
        reject(new Error('Could not reach bridge. Is "alph connect" running?'));
      };

      ws.onclose = (e) => {
        this._connected = false;
        if (e.code === 4001) reject(new Error('Invalid session token'));
        this.emit('disconnected', {});
      };
    });
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }

  send(msg: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(type: string, handler: MsgHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
    return () => this.off(type, handler);
  }

  off(type: string, handler: MsgHandler) {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }

  private emit(type: string, payload: any) {
    this.handlers.get(type)?.forEach(h => h(payload));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  detectAgents(): Promise<AgentInfo[]> {
    return new Promise(resolve => {
      const off = this.on('agents', (payload) => { off(); resolve(payload); });
      this.send({ type: 'detect_agents' });
    });
  }

  getStatus(): Promise<AgentInfo[]> {
    return new Promise(resolve => {
      const off = this.on('status', (payload) => { off(); resolve(payload); });
      this.send({ type: 'get_status' });
    });
  }

  configure(payload: object, onLog?: (entry: LogEntry) => void): Promise<OperationResult> {
    return new Promise(resolve => {
      const offResult = this.on('configure_result', (p) => { offLog(); offResult(); resolve(p); });
      const offLog = onLog ? this.on('log', onLog) : () => {};
      this.send({ type: 'configure', payload });
    });
  }

  remove(payload: object, onLog?: (entry: LogEntry) => void): Promise<OperationResult> {
    return new Promise(resolve => {
      const offResult = this.on('remove_result', (p) => { offLog(); offResult(); resolve(p); });
      const offLog = onLog ? this.on('log', onLog) : () => {};
      this.send({ type: 'remove', payload });
    });
  }
}

export const bridge = new BridgeClient();
