// useFriendRequests: hook per gestire richieste di amicizia con sottoscrizione real-time

// Responsabilità:
// Carica le richieste all'avvio
// Sottoscrive alle nuove richieste ricevute
// Fornisce funzioni per inviare/accettare/rifiutare/annullare

// Usato principalmente da FriendsPage.tsx, NotificationsPage.tsx, RootLayout.tsx (per inizializzare la sottoscrizione globale).

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    loadFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    setFriendRequests,
    loadFriends,
} from '../store/slices/friendsSlice';
import { subscribeToFriendRequests } from '../firebase/friendRequests';
import toast from 'react-hot-toast';

export function useFriendRequests() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const {
        pendingRequests,
        sentRequests,
        requestsLoading,
        requestsError,
    } = useAppSelector((state) => state.friends);

    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Sottoscrizione real-time alle richieste ricevute
    useEffect(() => {
        if (!user.uid) return;

        // Carica inizialmente
        dispatch(loadFriendRequests(user.uid));

        // Sottoscrivi per aggiornamenti real-time
        unsubscribeRef.current = subscribeToFriendRequests(user.uid, (requests) => {
            dispatch(setFriendRequests(requests));
            // Usato il badge sul menu
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [dispatch, user.uid]);

    // Invia richiesta
    const send = useCallback(
        async (toUID: string) => {
            if (!user.uid || !user.displayName) return;

            try {
                await dispatch(
                    sendFriendRequest({
                        fromUID: user.uid,
                        fromName: user.displayName,
                        fromAvatar: user.avatarUrl,
                        toUID,
                    })
                ).unwrap();

                toast.success('Richiesta inviata!');

                // Ricarica richieste inviate
                dispatch(loadFriendRequests(user.uid));
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Errore invio richiesta');
            }
        },
        [dispatch, user]
    );

    // Accetta richiesta
    const accept = useCallback(
        async (requestId: string) => {
            try {
                await dispatch(acceptFriendRequest(requestId)).unwrap();
                toast.success('Amicizia accettata!');

                // Ricarica lista amici
                if (user.uid) {
                    dispatch(loadFriends(user.uid));
                }
            } catch (error) {
                toast.error('Errore accettazione richiesta');
            }
        },
        [dispatch, user.uid]
    );

    // Rifiuta richiesta
    const reject = useCallback(
        async (requestId: string) => {
            try {
                await dispatch(rejectFriendRequest(requestId)).unwrap();
                toast('Richiesta rifiutata', { icon: '👋' });
            } catch (error) {
                toast.error('Errore rifiuto richiesta');
            }
        },
        [dispatch]
    );

    // Annulla richiesta inviata
    const cancel = useCallback(
        async (requestId: string) => {
            try {
                await dispatch(cancelFriendRequest(requestId)).unwrap();
                toast('Richiesta annullata');
            } catch (error) {
                toast.error('Errore annullamento richiesta');
            }
        },
        [dispatch]
    );

    return {
        // Stato
        pendingRequests,
        sentRequests,
        requestsLoading,
        requestsError,
        pendingCount: pendingRequests.length,

        // Azioni
        sendRequest: send,
        acceptRequest: accept,
        rejectRequest: reject,
        cancelRequest: cancel,
    };
}

export default useFriendRequests;
