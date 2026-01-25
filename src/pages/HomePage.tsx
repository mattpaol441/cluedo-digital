import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import { useAppSelector } from '../store/hooks';

import ActionCard from '../components/MenuCard/ActionCard';
import ActionGrid from '../components/MenuCard/ActionGrid';
import { Gamepad2, Plus, Trophy, Users } from 'lucide-react';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppSelector(state => state.user);

    // User data from Redux
    const currentUser = {
        displayName: user.displayName,
        avatar: user.avatarUrl,
        isOnline: user.isOnline
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">

            {/* THE SIDEBAR MENU */}
            <HamburgerWithNotifications user={currentUser} />

            {/* HOMEPAGE CONTENT */}
            <div className="p-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Benvenuto su Cluedo Digital</h1>
                <p className="text-slate-400">
                    Premi il tasto menu in alto a sinistra per iniziare.
                </p>
                {/* BUTTON GRID */}
                <ActionGrid>
                    {/* Button 1: New Game */}
                    <ActionCard
                        title="Nuova Partita"
                        description="Crea una stanza o gioca in locale"
                        icon={Gamepad2}
                        onClick={() => navigate('/new-game')}
                    />

                    {/* Button 2: Join (Multiplayer) */}
                    <ActionCard
                        title="Unisciti"
                        description="Entra in una partita esistente"
                        icon={Plus}
                        onClick={() => navigate('/join')}
                    />

                    {/* Button 3: Ranking */}
                    <ActionCard
                        title="Classifica"
                        description="I migliori detective globali"
                        icon={Trophy}
                        onClick={() => console.log('TODO: ranking page')}
                    />

                    {/* Button 4: Friends */}
                    <ActionCard
                        title="Amici"
                        description="Gestisci la tua lista amici"
                        icon={Users}
                        onClick={() => navigate('/friends')}
                    />
                </ActionGrid>
            </div>

        </div>
    );
};

export default HomePage;