import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <BrowserRouter basename="/Alph">
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
