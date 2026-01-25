// FriendsPage: pagina principale gestione amici

import React from 'react';
import { Users, UserPlus, Bell } from 'lucide-react';
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import { useAppSelector } from '../store/hooks';
import { useFriends } from '../hooks/useFriends';
import { useFriendRequests } from '../hooks/useFriendRequests';
import {
    SearchBar,
    UserSearchResults,
    FriendRequestItem,
    FriendsList,
} from '../components/friends';

const FriendsPage: React.FC = () => {
    const user = useAppSelector((state) => state.user);

    const {
        friends,
        friendsLoading,
        searchResults,
        isSearching,
        search,
        removeFriend,
    } = useFriends();

    const {
        pendingRequests,
        sentRequests,
        sendRequest,
        acceptRequest,
        rejectRequest,
    } = useFriendRequests();

    // User data for sidebar
    const currentUser = {
        displayName: user.displayName,
        avatar: user.avatarUrl,
        isOnline: user.isOnline,
    };

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
                        <Users className="w-8 h-8 text-yellow-500" />
                        Amici
                    </h1>
                    <p className="text-slate-400">
                        Gestisci la tua lista amici e cerca nuovi giocatori
                    </p>
                </div>

                {/* Sezione Ricerca */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="w-5 h-5 text-slate-400" />
                        <h2 className="font-medium text-slate-300">Cerca Utenti</h2>
                    </div>

                    <SearchBar
                        onSearch={search}
                        placeholder="Cerca per nome utente..."
                    />

                    {/* Risultati ricerca */}
                    {(searchResults.length > 0 || isSearching) && (
                        <div className="mt-4">
                            <UserSearchResults
                                results={searchResults}
                                isLoading={isSearching}
                                onSendRequest={sendRequest}
                                sentRequests={sentRequests}
                                friends={friends}
                            />
                        </div>
                    )}
                </section>

                {/* Sezione Richieste Pendenti */}
                {pendingRequests.length > 0 && (
                    <section className="mb-8 p-4 bg-slate-900/50 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-5 h-5 text-yellow-500" />
                            <h2 className="font-medium text-yellow-500">
                                Richieste in attesa ({pendingRequests.length})
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

                {/* Sezione Lista Amici */}
                <section>
                    <FriendsList
                        friends={friends}
                        isLoading={friendsLoading}
                        onRemove={removeFriend}
                    />
                </section>
            </main>
        </div>
    );
};

export default FriendsPage;
