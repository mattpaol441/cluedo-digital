// RegisterForm: form di Registrazione
// Gestisce la registrazione di nuovi utenti.


import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearAuthError } from '../../store/slices/userSlice';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const { isLoading, authError } = useAppSelector(state => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(registerUser({ email, password, displayName }));
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Unisciti ai Detective</h2>
        <p className="text-slate-400 text-sm">Crea il tuo account investigatore</p>
      </div>

      {/* Errore */}
      {authError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg flex items-center gap-2 text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Nome Detective
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none transition-colors"
              placeholder="Sherlock Holmes"
              required
              minLength={3}
            />
          </div>
        </div>

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
              minLength={6}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">Minimo 6 caratteri</p>
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
              <UserPlus className="w-5 h-5" />
              Crea Account
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="mt-6 text-center text-slate-400 text-sm">
        Hai già un account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-yellow-500 hover:text-yellow-400 font-semibold"
        >
          Accedi
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
