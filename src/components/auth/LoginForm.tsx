// LoginForm: form di Login
// Gestisce l'autenticazione dell'utente esistente.

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearAuthError } from '../../store/slices/userSlice';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const dispatch = useAppDispatch();
  const { isLoading, authError } = useAppSelector(state => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Bentornato, Detective</h2>
        <p className="text-slate-400 text-sm">Accedi per continuare le indagini</p>
      </div>

      {/* Errore */}
      {authError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg flex items-center gap-2 text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="detective@cluedo.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Accedi
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <p className="mt-6 text-center text-slate-400 text-sm">
        Non hai un account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-yellow-500 hover:text-yellow-400 font-semibold"
        >
          Registrati
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
