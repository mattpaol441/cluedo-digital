import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Loader2 } from 'lucide-react';

// Components
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import JoinGameForm from '../components/game/JoinGameForm';
import { usePreLobby } from '../hooks/usePreLobby';

const JoinGamePage: React.FC = () => {
    const navigate = useNavigate();
    const userState = useAppSelector(state => state.user);
    const { joinRoom, isJoining, error: joinError } = usePreLobby();
    const [localError, setLocalError] = useState<string | null>(null);

    // Format user data for sidebar
    const user = {
        displayName: userState.displayName,
        avatar: userState.avatarUrl,
        isOnline: userState.isOnline,
    };

    const handleJoinRoom = async (code: string) => {
        setLocalError(null);

        // Verifica che l'utente sia loggato
        if (!userState.uid) {
            setLocalError('Devi essere loggato per unirti a una partita');
            navigate('/auth');
            return;
        }

        // Verifica che il codice sia valido (6 caratteri per la pre-lobby)
        if (!code || code.length < 6) {
            setLocalError('Inserisci il codice completo della stanza (6 caratteri)');
            return;
        }

        console.log(`[JOIN GAME] Tentativo di connessione alla stanza: ${code}`);
        console.log(`[JOIN GAME] Utente: ${userState.displayName} (${userState.uid})`);

        // Tenta il join alla room Firestore
        const success = await joinRoom(code);

        if (!success) {
            console.log('[JOIN GAME] Join fallito');
        }
    };

    // Combina errori locali e dal server
    const displayError = localError || joinError;

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

            {/* Sidebar */}
            <HamburgerWithNotifications user={user} />

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Central Content */}
            <main className="min-h-screen flex flex-col items-center justify-center p-6 z-10 relative">

                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2">
                        CLUEDO <span className="text-yellow-500">DIGITAL</span>
                    </h1>
                </div>

                {/* Errore */}
                {displayError && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 max-w-md text-center">
                        {displayError}
                    </div>
                )}

                {/* Central Form */}
                <JoinGameForm
                    onSubmit={handleJoinRoom}
                    isLoading={isJoining}
                />

                {/* Loading indicator */}
                {isJoining && (
                    <div className="mt-4 flex items-center gap-2 text-yellow-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connessione in corso...</span>
                    </div>
                )}

                {/* Quick link to go back */}
                <button
                    onClick={() => navigate('/home')}
                    className="mt-8 text-slate-500 text-sm hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
                    disabled={isJoining}
                >
                    Torna alla Home
                </button>

            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-slate-700 text-xs z-10">
                Inserisci il codice univoco per accedere alla lobby privata.
            </footer>
        </div>
    );
};

export default JoinGamePage;
