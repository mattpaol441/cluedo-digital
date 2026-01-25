// useLobbyInvites: hook per gestire inviti lobby con auto-join alla lobby

// Responsabilità:
// Sottoscrive agli inviti ricevuti
// Quando l'utente accetta, fa joinRoom() + salva in localStorage + naviga alla lobby

// Chiama joinRoom() da firebase/preLobby.ts e usa le stesse chiavi localStorage che usePreLobby si aspetta di trovare.

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    loadLobbyInvites,
    sendLobbyInvite,
    acceptLobbyInvite,
    rejectLobbyInvite,
    setLobbyInvites,
} from '../store/slices/friendsSlice';
import { subscribeToLobbyInvites } from '../firebase/lobbyInvites';
import { joinRoom } from '../firebase/preLobby';
import toast from 'react-hot-toast';

export function useLobbyInvites() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user);
    const { lobbyInvites, invitesLoading } = useAppSelector((state) => state.friends);

    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Accetta invito con auto-join
    const handleAccept = useCallback(
        async (inviteId: string) => {
            if (!user.uid || !user.displayName) return;

            try {
                const result = await dispatch(acceptLobbyInvite(inviteId)).unwrap();
                const { roomCode } = result;

                // Auto-join alla lobby
                const joinResult = await joinRoom(
                    roomCode,
                    user.uid,
                    user.displayName,
                    user.avatarUrl
                );

                if (joinResult.success) {
                    // IMPORTANTE: Salva in localStorage per usePreLobby
                    // Questo permette all'hook di sottoscriversi alla room
                    localStorage.setItem('cluedo_room_code', roomCode);
                    localStorage.setItem('cluedo_room_is_host', 'false');

                    toast.success('Unito alla lobby!');
                    navigate(`/lobby/${roomCode}`);
                } else {
                    toast.error(joinResult.error || 'Errore join lobby');
                }
            } catch (error) {
                toast.error('Errore accettazione invito');
            }
        },
        [dispatch, navigate, user]
    );

    // Sottoscrizione real-time agli inviti
    useEffect(() => {
        if (!user.uid) return;

        // Carica inizialmente
        dispatch(loadLobbyInvites(user.uid));

        // Sottoscrivi per aggiornamenti real-time
        unsubscribeRef.current = subscribeToLobbyInvites(user.uid, (invites) => {
            dispatch(setLobbyInvites(invites));
            // Rimosso toast per nuovi inviti - usa invece il badge sul menu
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [dispatch, user.uid]);

    // Invia invito
    const send = useCallback(
        async (toUID: string, roomCode: string) => {
            if (!user.uid || !user.displayName) return;

            try {
                await dispatch(
                    sendLobbyInvite({
                        fromUID: user.uid,
                        fromName: user.displayName,
                        fromAvatar: user.avatarUrl,
                        toUID,
                        roomCode,
                    })
                ).unwrap();

                toast.success('Invito inviato!');
            } catch (error) {
                toast.error('Errore invio invito');
            }
        },
        [dispatch, user]
    );

    // Rifiuta invito
    const reject = useCallback(
        async (inviteId: string) => {
            try {
                await dispatch(rejectLobbyInvite(inviteId)).unwrap();
                toast('Invito rifiutato', { icon: '👋' });
            } catch (error) {
                toast.error('Errore rifiuto invito');
            }
        },
        [dispatch]
    );

    return {
        // Stato
        lobbyInvites,
        invitesLoading,
        invitesCount: lobbyInvites.length,

        // Azioni
        sendInvite: send,
        acceptInvite: handleAccept,
        rejectInvite: reject,
    };
}

export default useLobbyInvites;
