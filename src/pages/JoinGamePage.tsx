import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/index';

// Components
import HamburgerSidebar from '../components/hamburgerSidebar/HamburgerSidebar';
import JoinGameForm from '../components/game/JoinGameForm';

const JoinGamePage: React.FC = () => {
    // User from redux store
    const user = useSelector((state: RootState) => state.user);
    
    // Socket logic  to be implemented here
    const handleJoinRoom = (code: string) => {
        console.log(`[JOIN GAME] Tentativo di connessione alla stanza: ${code}`);
        console.log(`[JOIN GAME] Utente: ${user.displayName} (${user.uid})`);
        
        alert(`Codice inviato: ${code}. Controlla la console!`);
    };

    const handleNavigation = (path: string) => {
        console.log("Navigazione richiesta:", path);
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
            
            {/* Sidebar */}
            <HamburgerSidebar user={user} onNavigate={handleNavigation} />

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Central Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
                
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2">
                        CLUEDO <span className="text-yellow-500">DIGITAL</span>
                    </h1>
                </div>

                {/* Central Form */}
                <JoinGameForm onSubmit={handleJoinRoom} />

                {/* Quick link to go back */}
                <button 
                    onClick={() => handleNavigation('/')}
                    className="mt-8 text-slate-500 text-sm hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
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