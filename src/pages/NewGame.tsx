import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';

import ActionCard from '../components/MenuCard/ActionCard';
import ActionGrid from '../components/MenuCard/ActionGrid';
import { Bot, Users, Loader2 } from 'lucide-react';
import { usePreLobby } from '../hooks/usePreLobby';

const NewGame: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppSelector(state => state.user);
    const { createRoom, isCreating, error } = usePreLobby();
    const [numPlayers, setNumPlayers] = useState(6);

    // User data from Redux
    const currentUser = {
        displayName: user.displayName,
        avatar: user.avatarUrl,
        isOnline: user.isOnline
    };

    const handleCreateOnlineGame = async () => {
        if (!user.uid) {
            // Redirect al login se non autenticato
            navigate('/auth');
            return;
        }
        // Crea la room Firestore (non il match BoardGame.io)
        await createRoom(numPlayers);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">

            {/* Sidebar */}
            <HamburgerWithNotifications user={currentUser} />

            {/* Central Content */}
            <div className="p-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Nuova Partita</h1>
                <p className="text-slate-400 mb-8">
                    Scegli se giocare online con i tuoi amici o in locale contro l'IA.
                </p>

                {/* Errore creazione */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 max-w-md mx-auto">
                        {error}
                    </div>
                )}

                {/* Selettore numero giocatori per online */}
                <div className="mb-8 max-w-md mx-auto">
                    <label className="block text-slate-400 mb-2">
                        Numero massimo di giocatori per la partita online:
                    </label>
                    <div className="flex justify-center gap-2">
                        {[3, 4, 5, 6].map(n => (
                            <button
                                key={n}
                                onClick={() => setNumPlayers(n)}
                                className={`w-12 h-12 rounded-lg font-bold transition-all ${numPlayers === n
                                        ? 'bg-yellow-500 text-slate-900'
                                        : 'bg-slate-800 text-white hover:bg-slate-700'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Button Grid */}
                <ActionGrid>
                    {/* Button 1: Local Game vs AI */}
                    <ActionCard
                        title="Gioca in locale"
                        description="Sfida l'IA"
                        icon={Bot}
                        onClick={() => navigate('/game/local')}
                    />

                    {/* Button 2: Online Multiplayer */}
                    <ActionCard
                        title={isCreating ? "Creazione..." : "Gioca Online"}
                        description={`Crea una stanza per max ${numPlayers} giocatori`}
                        icon={isCreating ? Loader2 : Users}
                        onClick={handleCreateOnlineGame}
                    />
                </ActionGrid>
            </div>

        </div>
    );
};

export default NewGame;
