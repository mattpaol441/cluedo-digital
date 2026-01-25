
// AuthPage: pagina di autenticazione 
// Gestisce il toggle tra Login e Registrazione.
// Quando l'utente è autenticato, naviga automaticamente alla home.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true); // Usa uno stato locale isLoginMode per mostrare il form di login o quello di registrazione.
  const { isLoggedIn } = useAppSelector(state => state.user); // Prende lo stato di login reale da Redux, che è sincronizzato con Firebase Auth tramite l’observer in App.tsx.
  const navigate = useNavigate();

  // Redirect automatico se già loggato
  useEffect(() => {
    if (isLoggedIn) { // Se isLoggedIn è true, l'utente è autenticato.
      navigate('/home');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      
      {/* Logo/Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
          CLUEDO <span className="text-yellow-500">DIGITAL</span>
        </h1>
      </div>

      {/* Form Container */}
      <div className="relative z-10">
        {isLoginMode ? (
          <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
