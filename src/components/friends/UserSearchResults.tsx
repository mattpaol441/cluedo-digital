// UserSearchResults: lista risultati ricerca con bottone aggiungi amico

import React from 'react';
import { UserPlus, Loader2, Check } from 'lucide-react';
import type { UserProfile, FriendRequest, FriendProfile } from '../../types';

interface UserSearchResultsProps {
    results: UserProfile[];
    isLoading: boolean;
    onSendRequest: (toUID: string) => void;
    sentRequests: FriendRequest[];
    friends: FriendProfile[];
}

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
    results,
    isLoading,
    onSendRequest,
    sentRequests,
    friends,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                <span className="ml-2 text-slate-400">Ricerca in corso...</span>
            </div>
        );
    }

    if (results.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Risultati Ricerca</h3>
            {results.map((user) => {
                const isPending = sentRequests.some((r) => r.toUID === user.uid);
                const isFriend = friends.some((f) => f.uid === user.uid);

                return (
                    <div
                        key={user.uid}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-lg font-bold">
                                        {user.displayName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{user.displayName}</p>
                                {isFriend && (
                                    <span className="text-xs text-green-400">Già amici</span>
                                )}
                            </div>
                        </div>

                        {isFriend ? (
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                <Check className="w-4 h-4" />
                                Amico
                            </div>
                        ) : isPending ? (
                            <div className="px-3 py-1 bg-slate-700 text-slate-400 rounded-lg text-sm">
                                Richiesta inviata
                            </div>
                        ) : (
                            <button
                                onClick={() => onSendRequest(user.uid)}
                                className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Aggiungi
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default UserSearchResults;
