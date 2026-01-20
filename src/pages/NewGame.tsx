import React from 'react';
import HamburgerSidebar from '../components/hamburgerSidebar/HamburgerSidebar';

import ActionCard from '../components/MenuCard/ActionCard';
import ActionGrid from '../components/MenuCard/ActionGrid';
import { Bot, Users} from 'lucide-react';

const NewGame: React.FC = () => {
    
    // Simulated User Data
    const currentUser = {
        displayName: "Detective Conan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Conan", // Esempio avatar
        isOnline: true
    };

    // Navigation logic to be implemented here
    const handleAction = (action: string) => {
        console.log("Azione cliccata:", action);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">
            
            {/* Sidebar */}
            <HamburgerSidebar 
                user={currentUser} 
                onNavigate={(path) => console.log("Navigazione NewGame:", path)}
            />

            {/* Central Content */}
            <div className="p-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Nuova Partita</h1>
                <p className="text-slate-400">
                    Scegli se giocare online con i tuoi amici o in locale contro l'IA.
                </p>
                {/* Button Grid */}
                <ActionGrid>
                    {/* Button 1: New Game */}
                    <ActionCard 
                        title="Gioca in locale" 
                        description="Sfida l'IA"
                        icon={Bot} 
                        onClick={() => handleAction('new-game')}
                    />

                    {/* Button 2: Join (Multiplayer) */}
                    <ActionCard 
                        title="Gioca Online" 
                        description="Crea una stanza e invita i tuoi amici"
                        icon={Users} 
                        onClick={() => handleAction('join-game')}
                    />
                </ActionGrid>
            </div>

        </div>
    );
};

export default NewGame;