/** SOLO PER TESTARE, NON SERVE 
 * Test Component - Testare autenticazione Firebase + Redux
 * 
 * Questo componente è SOLO per testing. Verrà rimosso una volta che tutto funziona.
 * Serve a verificare che:
 * - Le chiamate Firebase funzionano
 * - Redux è sincronizzato
 * - Gli errori vengono gestiti correttamente
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser, logoutUser, clearAuthError } from '../../store/slices/userSlice';
import type { RootState, AppDispatch } from '../../store';

const AuthTestComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, isLoading, authError, uid, email, displayName, profileLoaded } = useSelector(
    (state: RootState) => state.user
  );

  // Form state
  const [email_, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName_, setDisplayName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(registerUser({ email: email_, password, displayName: displayName_ }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(loginUser({ email: email_, password }));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">🧪 Auth Test</h1>

        {/* Status */}
        <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 space-y-2">
            <div>
              <span className="font-bold text-yellow-500">Logged In:</span>{' '}
              <span className="text-white">{isLoggedIn ? '✅ YES' : '❌ NO'}</span>
            </div>
            <div>
              <span className="font-bold text-yellow-500">Loading:</span>{' '}
              <span className="text-white">{isLoading ? '⏳ YES' : '✅ NO'}</span>
            </div>
            <div>
              <span className="font-bold text-yellow-500">Profile Loaded:</span>{' '}
              <span className="text-white">{profileLoaded ? '✅ YES' : '❌ NO'}</span>
            </div>
            {uid && (
              <>
                <div className="mt-2 border-t border-slate-600 pt-2">
                  <div className="text-yellow-500 font-bold mb-1">User Data:</div>
                  <div className="text-xs text-slate-300">
                    <div>UID: {uid}</div>
                    <div>Email: {email}</div>
                    <div>Name: {displayName}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {authError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
            ⚠️ {authError}
          </div>
        )}

        {/* Logged In State */}
        {isLoggedIn ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-900/50 border border-green-600 rounded text-green-200 text-sm">
              ✅ Benvenuto, {displayName}!
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold rounded transition-colors"
            >
              {isLoading ? '⏳ Logging out...' : '🚪 Logout'}
            </button>
          </div>
        ) : (
          <>
            {/* Mode Toggle */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded font-bold transition-colors ${
                  mode === 'login'
                    ? 'bg-yellow-500 text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded font-bold transition-colors ${
                  mode === 'register'
                    ? 'bg-yellow-500 text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {mode === 'register' && (
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName_}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email_}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
              />

              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 text-slate-900 font-bold rounded transition-colors"
              >
                {isLoading ? '⏳ Loading...' : mode === 'login' ? '🔓 Login' : '📝 Register'}
              </button>
            </form>
          </>
        )}

        {/* Debug Info */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
            <div className="font-bold text-yellow-500 mb-1">📊 Debug Info:</div>
            <div>
              State: {JSON.stringify({ isLoggedIn, isLoading, profileLoaded, hasError: !!authError }, null, 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestComponent;
