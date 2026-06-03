import { useEffect, useState } from 'react';
import { bridge } from './bridge';

/** Returns { connected, reconnecting } and silently retries the saved session on mount. */
export function useBridge() {
  const [connected,    setConnected]    = useState(bridge.connected);
  const [reconnecting, setReconnecting] = useState(!bridge.connected);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (bridge.connected) {
        setConnected(true);
        setReconnecting(false);
        return;
      }
      const info = await bridge.tryReconnect();
      if (cancelled) return;
      setConnected(!!info);
      setReconnecting(false);
    }

    init();
    const off = bridge.on('disconnected', () => setConnected(false));
    return () => { cancelled = true; off(); };
  }, []);

  return { connected, reconnecting };
}
