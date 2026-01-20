import React, { useState } from 'react';
import { 
    Menu, X, Home, Users, Settings, LogOut, 
    HelpCircle, Trophy, Plus, Gamepad2,
    Bell
} from 'lucide-react';

// Import componenti
import ProfileView from '../ProfileView'; // Assicurati il path sia corretto
import MenuSection, {type MenuItemData } from './MenuSection';

//TODO: Mettere la  home direttamente nel return e toglierla dal menù primario
// Mettere Redux al posto dello useState
// Gestire con redux le pagine da mettere nei menu, l'utente
// Gestione path pagine
// Cambiare nome delle sezioni


// Example data for menu sections
const PRIMARY_MENU: MenuItemData[] = [
    {id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'play', label: 'Nuova Partita', icon: Gamepad2, path: '/play' },
    { id: 'join', label: 'Unisciti a una Partita', icon: Plus, path: '/join' },
    {id: 'stats', label: 'Statistiche', icon: Trophy, path: '/stats' },
    { id: 'friends', label: 'Amici', icon: Users, path: '/friends' },
];

const SECONDARY_MENU: MenuItemData[] = [
    { id: 'notify', label: 'Notifiche', icon: Bell, path: '/notify' },
    { id: 'settings', label: 'Impostazioni', icon: Settings, path: '/settings' },
    { id: 'help', label: 'Supporto', icon: HelpCircle, path: '/help' },
];

interface HamburgerSidebarProps {
    user: { displayName: string; avatar?: string; isOnline: boolean };
    onNavigate?: (path: string) => void; // Callback per gestire la navigazione esterna
}

const HamburgerSidebar: React.FC<HamburgerSidebarProps> = ({ user, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Funzione interna per gestire il click: naviga e chiude il menu
    const handleNavigation = (path: string) => {
        console.log(`Navigazione verso: ${path}`);
        if (onNavigate) onNavigate(path);
        setIsOpen(false); // Chiude il menu dopo il click (UX mobile standard)
    };

    return (
        <>
            {/* 1. HAMBURGER BUTTON (Visible only when closed) */}
            {/* Positioned fixed at top left */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-40 p-3 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors border border-slate-700"
                    aria-label="Apri Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* 2. DARK OVERLAY (Click outside to close) */}
            {/* Appears only when open. backdrop-blur makes the background blurry */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* 3. THE SIDE DRAWER (The actual menu) */}
            <aside 
                className={`
                    fixed top-0 left-0 z-50 h-full w-80 
                    bg-slate-900 border-r border-slate-800 shadow-2xl
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* A. HEADER: Close Button + Title */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <span className="text-sm font-bold tracking-widest text-slate-400">MENU</span>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* B. PROFILE SECTION */}
                <div className="p-6 bg-slate-800/50 border-b border-slate-800">
                    <ProfileView 
                        name={user.displayName}
                        imageUrl={user.avatar}
                        size="medium"
                        isOnline={user.isOnline}
                        layout="horizontal" 
                        variant="simple"    
                        onClick={() => handleNavigation('/profile')}
                    />
                </div>

                {/* C. NAVIGATION LISTS (Scrollable if needed) */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
                    
                    {/* List 1: Primary (2 buttons) */}
                    <MenuSection 
                        items={PRIMARY_MENU} 
                        onNavigate={handleNavigation} 
                    />

                    {/* Visual Divider */}
                    <div className="h-px bg-slate-800 mx-4" />

                    {/* List 2: Secondary (4 buttons) */}
                    <MenuSection 
                        title="Social & Altro"
                        items={SECONDARY_MENU} 
                        onNavigate={handleNavigation} 
                    />
                </div>

                {/* D. FOOTER Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={() => alert("Logout effettuato")}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Esci
                    </button>
                </div>
            </aside>
        </>
    );
};

export default HamburgerSidebar;