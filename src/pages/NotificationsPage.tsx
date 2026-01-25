// NotificationsPage: pagina notifiche (richieste amicizia e inviti lobby)

import React from 'react';
import { Bell, Users, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import { useAppSelector } from '../store/hooks';
import { useFriendRequests } from '../hooks/useFriendRequests';
import { useLobbyInvites } from '../hooks/useLobbyInvites';
import { FriendRequestItem } from '../components/friends';

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user);

    const {
        pendingRequests,
        acceptRequest,
        rejectRequest,
    } = useFriendRequests();

    const {
        lobbyInvites,
        acceptInvite,
        rejectInvite,
    } = useLobbyInvites();

    // User data for sidebar
    const currentUser = {
        displayName: user.displayName,
        avatar: user.avatarUrl,
        isOnline: user.isOnline,
    };

    const totalNotifications = pendingRequests.length + lobbyInvites.length;

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">
            {/* Sidebar */}
            <HamburgerWithNotifications user={currentUser} />

            {/* Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Main Content */}
            <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
                        <Bell className="w-8 h-8 text-yellow-500" />
                        Notifiche
                    </h1>
                    <p className="text-slate-400">
                        {totalNotifications > 0
                            ? `Hai ${totalNotifications} notifiche`
                            : 'Nessuna nuova notifica'}
                    </p>
                </div>

                {/* Sezione Inviti Lobby */}
                {lobbyInvites.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Gamepad2 className="w-5 h-5 text-yellow-500" />
                            <h2 className="font-medium text-slate-300">
                                Inviti Partita ({lobbyInvites.length})
                            </h2>
                        </div>

                        <div className="space-y-2">
                            {lobbyInvites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="flex items-center justify-between p-4 bg-slate-800 border border-yellow-500/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <Gamepad2 className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{invite.fromName}</p>
                                            <span className="text-xs text-slate-400">
                                                Ti ha invitato a giocare
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => acceptInvite(invite.id)}
                                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
                                        >
                                            Accetta
                                        </button>
                                        <button
                                            onClick={() => rejectInvite(invite.id)}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                        >
                                            Rifiuta
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Sezione Richieste Amicizia */}
                {pendingRequests.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-slate-400" />
                            <h2 className="font-medium text-slate-300">
                                Richieste Amicizia ({pendingRequests.length})
                            </h2>
                        </div>

                        <div className="space-y-2">
                            {pendingRequests.map((request) => (
                                <FriendRequestItem
                                    key={request.id}
                                    request={request}
                                    onAccept={acceptRequest}
                                    onReject={rejectRequest}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Stato vuoto */}
                {totalNotifications === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Bell className="w-16 h-16 text-slate-600 mb-4" />
                        <p className="text-slate-400 text-lg">Tutto tranquillo!</p>
                        <p className="text-sm text-slate-500 mt-2">
                            Le nuove notifiche appariranno qui
                        </p>
                        <button
                            onClick={() => navigate('/friends')}
                            className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Vai agli Amici
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationsPage;
