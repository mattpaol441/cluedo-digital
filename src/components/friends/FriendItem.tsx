// FriendItem: singolo amico con azioni

import React from 'react';
import { UserMinus, Gamepad2 } from 'lucide-react';
import type { FriendProfile } from '../../types';

interface FriendItemProps {
    friend: FriendProfile;
    onRemove: (friendUID: string) => void;
    onInvite?: (friendUID: string) => void;
    showInvite?: boolean;
}

export const FriendItem: React.FC<FriendItemProps> = ({
    friend,
    onRemove,
    onInvite,
    showInvite = false,
}) => {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
                {/* Avatar con indicatore online */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                        {friend.avatarUrl ? (
                            <img
                                src={friend.avatarUrl}
                                alt={friend.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-lg font-bold">
                                {friend.displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* Indicatore online */}
                    <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${friend.isOnline ? 'bg-green-500' : 'bg-slate-500'
                            }`}
                    />
                </div>

                <div>
                    <p className="font-medium">{friend.displayName}</p>
                    <span className={`text-xs ${friend.isOnline ? 'text-green-400' : 'text-slate-500'}`}>
                        {friend.isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Bottone invita (opzionale, per lobby) */}
                {showInvite && friend.isOnline && onInvite && (
                    <button
                        onClick={() => onInvite(friend.uid)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors text-sm"
                    >
                        <Gamepad2 className="w-4 h-4" />
                        Invita
                    </button>
                )}

                {/* Bottone rimuovi */}
                <button
                    onClick={() => onRemove(friend.uid)}
                    className="p-2 bg-slate-700 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Rimuovi amico"
                >
                    <UserMinus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FriendItem;
