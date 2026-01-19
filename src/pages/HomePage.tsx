import React from 'react';
import HamburgerSidebar from '../components/hamburgerSidebar/HamburgerSidebar';

import ActionCard from '../components/MenuCard/ActionCard';
import ActionGrid from '../components/MenuCard/ActionGrid';
import { Gamepad2, Plus, Trophy, Users } from 'lucide-react';

const HomePage: React.FC = () => {
    
    // Simulated User Data
    const currentUser = {
        displayName: "Detective Conan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Conan", // Esempio avatar
        isOnline: true
    };

    const handleAction = (action: string) => {
        console.log("Azione cliccata:", action);
        // Here we add the navigation logic based on action
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">
            
            {/* THE SIDEBAR MENU */}
            <HamburgerSidebar 
                user={currentUser} 
                onNavigate={(path) => console.log("Navigazione HomePage:", path)}
            />

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
                        onClick={() => handleAction('new-game')}
                    />

                    {/* Button 2: Join (Multiplayer) */}
                    <ActionCard 
                        title="Unisciti" 
                        description="Entra in una partita esistente"
                        icon={Plus} 
                        onClick={() => handleAction('join-game')}
                    />

                    {/* Button 3: Ranking */}
                    <ActionCard 
                        title="Classifica" 
                        description="I migliori detective globali"
                        icon={Trophy} 
                        onClick={() => handleAction('ranking')}
                    />

                    {/* Button 4: Friends */}
                    <ActionCard 
                        title="Amici" 
                        description="Gestisci la tua lista amici"
                        icon={Users} 
                        onClick={() => handleAction('friends')}
                    />
                </ActionGrid>
            </div>

        </div>
    );
};

export default HomePage;