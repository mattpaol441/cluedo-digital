import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, X, Home, Users, Settings, LogOut,
    HelpCircle, Trophy, Plus, Gamepad2,
    Bell
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/userSlice';

// Import componenti
import ProfileView from '../ProfileView';
import MenuSection, { type MenuItemData } from './MenuSection';

// Menu items con path URL
const PRIMARY_MENU: MenuItemData[] = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'play', label: 'Nuova Partita', icon: Gamepad2, path: '/new-game' },
    { id: 'join', label: 'Unisciti a una Partita', icon: Plus, path: '/join' },
    { id: 'stats', label: 'Statistiche', icon: Trophy, path: '/stats' },
    { id: 'friends', label: 'Amici', icon: Users, path: '/friends' },
];

const SECONDARY_MENU: MenuItemData[] = [
    { id: 'notify', label: 'Notifiche', icon: Bell, path: '/notifications' },
    { id: 'settings', label: 'Impostazioni', icon: Settings, path: '/home' }, // TODO: settings page
    { id: 'help', label: 'Supporto', icon: HelpCircle, path: '/home' }, // TODO: help page
];

interface HamburgerSidebarProps {
    user: { displayName: string; avatar?: string; isOnline: boolean };
    notificationCount?: number; // Numero di notifiche non lette
}

const HamburgerSidebar: React.FC<HamburgerSidebarProps> = ({ user, notificationCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Funzione interna per gestire il click: naviga e chiude il menu
    const handleNavigation = (path: string) => {
        navigate(path);
        setIsOpen(false); // Chiude il menu dopo il click (UX mobile standard)
    };

    // Logout handler
    const handleLogout = async () => {
        await dispatch(logoutUser());
        setIsOpen(false);
    };

    // Badge component
    const NotificationBadge = ({ count, className = '' }: { count: number; className?: string }) => {
        if (count === 0) return null;
        return (
            <span className={`absolute bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center ${className}`}>
                {count > 9 ? '9+' : count}
            </span>
        );
    };

    return (
        <>
            {/* 1. HAMBURGER BUTTON (Visible only when closed) */}
            {/* Positioned fixed at top left */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-40 p-3 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors border border-slate-700 relative"
                    aria-label="Apri Menu"
                >
                    <Menu className="w-6 h-6" />
                    {/* Badge sul pulsante hamburger */}
                    <NotificationBadge count={notificationCount} className="-top-1 -right-1" />
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

                    {/* List 2: Secondary con badge notifiche */}
                    <MenuSection
                        title="Social & Altro"
                        items={SECONDARY_MENU}
                        onNavigate={handleNavigation}
                        badgeCount={notificationCount} // Passa il conteggio per il badge su Notifiche
                        badgeItemId="notify" // ID dell'item che deve avere il badge
                    />
                </div>

                {/* D. FOOTER Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
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
