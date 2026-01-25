// useFriends: hook per gestire lista amici, ricerca utenti e aggiornamenti di presenza
// Funge da "collante" tra Redux e i componenti React. Incapsulano la logica e forniscono un'API pulita.

// Responsabilità:
// Carica friends quando l'utente fa login
// Sottoscrive agli aggiornamenti di presenza degli amici 
// Espone funzioni per cercare utenti e rimuovere amici

// Usato principalmente da FriendsPage e LobbyPage per invitare amici online

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    loadFriends,
    searchUsers,
    removeFriend,
    clearSearchResults,
    updateFriendOnlineStatus,
} from '../store/slices/friendsSlice';
import { subscribeToMultiplePresence } from '../firebase/presence';

export function useFriends() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const {
        friends,
        friendsLoading,
        friendsError,
        searchResults,
        isSearching,
        searchError,
    } = useAppSelector((state) => state.friends);

    const presenceUnsubRef = useRef<(() => void) | null>(null);

    // Carica amici all'avvio
    useEffect(() => {
        if (user.uid) {
            dispatch(loadFriends(user.uid));
        }
    }, [dispatch, user.uid]);

    // Sottoscrivi agli aggiornamenti di presenza degli amici
    // Usa JSON.stringify degli UID come dipendenza stabile
    const friendUIDsKey = friends.map(f => f.uid).sort().join(',');

    useEffect(() => {
        if (friends.length === 0) {
            // Nessun amico, nulla da sottoscrivere
            if (presenceUnsubRef.current) {
                presenceUnsubRef.current();
                presenceUnsubRef.current = null;
            }
            return;
        }

        const friendUIDs = friends.map((f) => f.uid);

        // Sottoscrivi alla presenza di tutti gli amici
        presenceUnsubRef.current = subscribeToMultiplePresence(
            friendUIDs,
            (presenceMap) => {
                // Aggiorna lo stato online di ogni amico nel Redux store
                Object.entries(presenceMap).forEach(([uid, isOnline]) => {
                    dispatch(updateFriendOnlineStatus({ uid, isOnline }));
                });
            }
        );

        return () => {
            if (presenceUnsubRef.current) {
                presenceUnsubRef.current();
                presenceUnsubRef.current = null;
            }
        };
    }, [friendUIDsKey, dispatch]);

    // Ricerca utenti
    const search = useCallback(
        (query: string) => {
            if (!user.uid) return;
            if (!query.trim()) {
                dispatch(clearSearchResults());
                return;
            }
            dispatch(searchUsers({ query, currentUserUID: user.uid }));
        },
        [dispatch, user.uid]
    );

    // Pulisci ricerca
    const clearSearch = useCallback(() => {
        dispatch(clearSearchResults());
    }, [dispatch]);

    // Rimuovi amico
    const remove = useCallback(
        (friendUID: string) => {
            if (!user.uid) return;
            dispatch(removeFriend({ uid: user.uid, friendUID }));
        },
        [dispatch, user.uid]
    );

    // Ricarica lista amici
    const refresh = useCallback(() => {
        if (user.uid) {
            dispatch(loadFriends(user.uid));
        }
    }, [dispatch, user.uid]);

    // Amici online
    const onlineFriends = friends.filter((f) => f.isOnline);

    return {
        // Stato
        friends,
        onlineFriends,
        friendsLoading,
        friendsError,

        // Ricerca
        searchResults,
        isSearching,
        searchError,

        // Azioni
        search,
        clearSearch,
        removeFriend: remove,
        refresh,
    };
}

export default useFriends;
