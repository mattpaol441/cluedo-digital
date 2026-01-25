// FriendRequestItem: singola richiesta con azioni accetta/rifiuta

import React from 'react';
import { Check, X } from 'lucide-react';
import type { FriendRequest } from '../../types';

interface FriendRequestItemProps {
    request: FriendRequest;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
}

export const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
    request,
    onAccept,
    onReject,
}) => {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                    {request.fromAvatar ? (
                        <img
                            src={request.fromAvatar}
                            alt={request.fromName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-lg font-bold">
                            {request.fromName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div>
                    <p className="font-medium">{request.fromName}</p>
                    <span className="text-xs text-slate-400">Vuole essere tuo amico</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onAccept(request.id)}
                    className="p-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors"
                    title="Accetta"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onReject(request.id)}
                    className="p-2 bg-slate-700 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Rifiuta"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FriendRequestItem;
