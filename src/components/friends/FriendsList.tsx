// FriendsList: lista amici con filtro online

import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import type { FriendProfile } from '../../types';
import FriendItem from './FriendItem';

interface FriendsListProps {
    friends: FriendProfile[];
    isLoading: boolean;
    onRemove: (friendUID: string) => void;
    onInvite?: (friendUID: string) => void;
    showInvite?: boolean;
}

export const FriendsList: React.FC<FriendsListProps> = ({
    friends,
    isLoading,
    onRemove,
    onInvite,
    showInvite = false,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                <span className="ml-2 text-slate-400">Caricamento amici...</span>
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400">Non hai ancora amici</p>
                <p className="text-sm text-slate-500 mt-1">
                    Cerca utenti per aggiungere amici
                </p>
            </div>
        );
    }

    // Ordina: online prima
    const sortedFriends = [...friends].sort((a, b) => {
        if (a.isOnline === b.isOnline) {
            return a.displayName.localeCompare(b.displayName);
        }
        return a.isOnline ? -1 : 1;
    });

    const onlineCount = friends.filter((f) => f.isOnline).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-300 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    I Miei Amici ({friends.length})
                </h3>
                {onlineCount > 0 && (
                    <span className="text-sm text-green-400">
                        {onlineCount} online
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {sortedFriends.map((friend) => (
                    <FriendItem
                        key={friend.uid}
                        friend={friend}
                        onRemove={onRemove}
                        onInvite={onInvite}
                        showInvite={showInvite}
                    />
                ))}
            </div>
        </div>
    );
};

export default FriendsList;
