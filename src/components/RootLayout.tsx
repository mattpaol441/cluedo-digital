// RootLayout.tsx: Layout principale con Auth Observer

// Gestisce:
// - Sincronizzazione Firebase Auth con Redux
// - Protezione route (redirect se non autenticato)
// - Loading state durante verifica auth
// - Presenza utente online/offline
// - Sottoscrizioni globali per notifiche (richieste amicizia, inviti lobby)


import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { subscribeToAuthChanges } from '../firebase/users';
import { setUserFromAuth, clearUser, loadUserProfile } from '../store/slices/userSlice';
import { usePresence } from '../hooks/usePresence';
import { useFriendRequests } from '../hooks/useFriendRequests';
import { useLobbyInvites } from '../hooks/useLobbyInvites';
import { Toaster } from 'react-hot-toast';

// Route che non richiedono autenticazione
const PUBLIC_ROUTES = ['/auth'];

const RootLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAppSelector(state => state.user);
  const [authChecked, setAuthChecked] = useState(false);

  // Hook per tracciare presenza online
  usePresence();

  // Hook per sottoscrizioni real-time alle notifiche
  // Questo popola Redux con pendingRequests e lobbyInvites
  useFriendRequests();
  useLobbyInvites();

  // Auth Observer
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        // Utente loggato
        dispatch(setUserFromAuth({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email || ''
        }));
        dispatch(loadUserProfile(user.uid));

        // Se siamo su /auth, vai alla home
        if (location.pathname === '/auth') {
          navigate('/home', { replace: true });
        }
      } else {
        // Utente non loggato
        dispatch(clearUser());

        // Se non siamo su una route pubblica, vai a /auth
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate('/auth', { replace: true });
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [dispatch, navigate, location.pathname]);

  // Loading durante verifica auth iniziale
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Protezione route: se non loggato e non su route pubblica
  if (!isLoggedIn && !PUBLIC_ROUTES.includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Reindirizzamento...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />
    </>
  );
};

export default RootLayout;

