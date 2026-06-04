import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Connect from './pages/Connect';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import StatusPage from './pages/Status';
import Remove from './pages/Remove';
import Nav from './components/Nav';

// Listens on BroadcastChannel for take_session events from other tabs.
// When received, claims the session and navigates to /connect so the
// new session is handled here instead of opening an extra tab.
function SessionTakeover() {
  const navigate = useNavigate();
  const tabId    = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    const bc = new BroadcastChannel('alph_connect');
    bc.onmessage = (e) => {
      if (e.data.type === 'take_session' && e.data.tabId !== tabId.current) {
        bc.postMessage({ type: 'claim', tabId: tabId.current });
        navigate(`/connect?claimed=1#token=${e.data.token}&port=${e.data.port}`);
      }
    };
    return () => bc.close();
  }, [navigate]);

  return null;
}

function ProtectedRoute({ session, children }: { session: Session | null; children: React.ReactNode }) {
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => { setSession(data.session); setLoading(false); })
      .catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <BrowserRouter basename="/Alph">
      <SessionTakeover />
      <Nav session={session} />
      <Routes>
        <Route path="/" element={<Landing session={session} />} />
        <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={session ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/connect" element={<ProtectedRoute session={session}><Connect /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
        <Route path="/setup" element={<ProtectedRoute session={session}><Setup /></ProtectedRoute>} />
        <Route path="/status" element={<ProtectedRoute session={session}><StatusPage /></ProtectedRoute>} />
        <Route path="/remove" element={<ProtectedRoute session={session}><Remove /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
