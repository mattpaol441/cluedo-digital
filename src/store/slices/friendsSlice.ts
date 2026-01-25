// Friends Slice: gestisce lo stato amici, richieste e inviti

// Contiene:
// - Lista amici con stato online
// - Richieste di amicizia (ricevute e inviate)
// - Inviti lobby
// - Risultati ricerca utenti

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { FriendProfile, FriendRequest, LobbyInvite } from '../../types';
import type { UserProfile } from '../../types/user';
import {
    getFriendProfiles,
    searchUsersByName,
    removeFriendship,
} from '../../firebase/friends';
import {
    getPendingRequests,
    getSentRequests,
    sendFriendRequest as sendFriendRequestFirebase,
    acceptFriendRequest as acceptFriendRequestFirebase,
    rejectFriendRequest as rejectFriendRequestFirebase,
    cancelFriendRequest as cancelFriendRequestFirebase,
} from '../../firebase/friendRequests';
import {
    getPendingInvites,
    sendLobbyInvite as sendLobbyInviteFirebase,
    acceptLobbyInvite as acceptLobbyInviteFirebase,
    rejectLobbyInvite as rejectLobbyInviteFirebase,
} from '../../firebase/lobbyInvites';

// STATO

export interface FriendsState {
    // Lista amici con stato online
    friends: FriendProfile[];
    friendsLoading: boolean;
    friendsError: string | null;

    // Richieste di amicizia ricevute e inviate
    pendingRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    requestsLoading: boolean;
    requestsError: string | null;

    // Inviti lobby ricevuti 
    lobbyInvites: LobbyInvite[];
    invitesLoading: boolean;

    // Risultati ricerca utenti
    searchResults: UserProfile[];
    searchQuery: string;
    isSearching: boolean;
    searchError: string | null;
}

const initialState: FriendsState = {
    friends: [],
    friendsLoading: false,
    friendsError: null,

    pendingRequests: [],
    sentRequests: [],
    requestsLoading: false,
    requestsError: null,

    lobbyInvites: [],
    invitesLoading: false,

    searchResults: [],
    searchQuery: '',
    isSearching: false,
    searchError: null,
};

// THUNKS

// Carica lista amici
export const loadFriends = createAsyncThunk(
    'friends/loadFriends',
    async (uid: string, { rejectWithValue }) => {
        try {
            const friends = await getFriendProfiles(uid);
            return friends;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore caricamento amici'
            );
        }
    }
);

// Cerca utenti
export const searchUsers = createAsyncThunk(
    'friends/searchUsers',
    async (
        { query, currentUserUID }: { query: string; currentUserUID: string },
        { rejectWithValue }
    ) => {
        try {
            if (!query.trim()) return [];
            const results = await searchUsersByName(query, currentUserUID);
            return results;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore ricerca'
            );
        }
    }
);

// Carica richieste amicizia
export const loadFriendRequests = createAsyncThunk(
    'friends/loadRequests',
    async (uid: string, { rejectWithValue }) => {
        try {
            const [pending, sent] = await Promise.all([
                getPendingRequests(uid),
                getSentRequests(uid),
            ]);
            return { pending, sent };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore caricamento richieste'
            );
        }
    }
);

// Invia richiesta amicizia
export const sendFriendRequest = createAsyncThunk(
    'friends/sendRequest',
    async (
        {
            fromUID,
            fromName,
            fromAvatar,
            toUID,
        }: {
            fromUID: string;
            fromName: string;
            fromAvatar?: string;
            toUID: string;
        },
        { rejectWithValue }
    ) => {
        try {
            await sendFriendRequestFirebase(fromUID, fromName, fromAvatar, toUID);
            return toUID;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore invio richiesta'
            );
        }
    }
);

// Accetta richiesta amicizia
export const acceptFriendRequest = createAsyncThunk(
    'friends/acceptRequest',
    async (requestId: string, { rejectWithValue }) => {
        try {
            await acceptFriendRequestFirebase(requestId);
            return requestId;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore accettazione'
            );
        }
    }
);

// Rifiuta richiesta amicizia
export const rejectFriendRequest = createAsyncThunk(
    'friends/rejectRequest',
    async (requestId: string, { rejectWithValue }) => {
        try {
            await rejectFriendRequestFirebase(requestId);
            return requestId;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore rifiuto'
            );
        }
    }
);

// Annulla richiesta inviata
export const cancelFriendRequest = createAsyncThunk(
    'friends/cancelRequest',
    async (requestId: string, { rejectWithValue }) => {
        try {
            await cancelFriendRequestFirebase(requestId);
            return requestId;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore annullamento'
            );
        }
    }
);

// Rimuovi amico
export const removeFriend = createAsyncThunk(
    'friends/removeFriend',
    async (
        { uid, friendUID }: { uid: string; friendUID: string },
        { rejectWithValue }
    ) => {
        try {
            await removeFriendship(uid, friendUID);
            return friendUID;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore rimozione amico'
            );
        }
    }
);

// Carica inviti lobby
export const loadLobbyInvites = createAsyncThunk(
    'friends/loadInvites',
    async (uid: string, { rejectWithValue }) => {
        try {
            const invites = await getPendingInvites(uid);
            return invites;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore caricamento inviti'
            );
        }
    }
);

// Invia invito lobby
export const sendLobbyInvite = createAsyncThunk(
    'friends/sendLobbyInvite',
    async (
        {
            fromUID,
            fromName,
            fromAvatar,
            toUID,
            roomCode,
        }: {
            fromUID: string;
            fromName: string;
            fromAvatar?: string;
            toUID: string;
            roomCode: string;
        },
        { rejectWithValue }
    ) => {
        try {
            await sendLobbyInviteFirebase(fromUID, fromName, fromAvatar, toUID, roomCode);
            return { toUID, roomCode };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore invio invito'
            );
        }
    }
);

// Accetta invito lobby (ritorna roomCode per navigazione)
export const acceptLobbyInvite = createAsyncThunk(
    'friends/acceptLobbyInvite',
    async (inviteId: string, { rejectWithValue }) => {
        try {
            const roomCode = await acceptLobbyInviteFirebase(inviteId);
            return { inviteId, roomCode };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore accettazione invito'
            );
        }
    }
);

// Rifiuta invito lobby
export const rejectLobbyInvite = createAsyncThunk(
    'friends/rejectLobbyInvite',
    async (inviteId: string, { rejectWithValue }) => {
        try {
            await rejectLobbyInviteFirebase(inviteId);
            return inviteId;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Errore rifiuto invito'
            );
        }
    }
);

// SLICE

const friendsSlice = createSlice({
    name: 'friends',
    initialState,

    reducers: {
        // Aggiorna richieste pending in tempo reale (usato dalla sottoscrizione real-time)
        setFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
            state.pendingRequests = action.payload;
        },

        // Aggiorna inviti lobby in tempo reale (usato dalla sottoscrizione real-time)
        setLobbyInvites: (state, action: PayloadAction<LobbyInvite[]>) => {
            state.lobbyInvites = action.payload;
        },

        // Aggiorna stato online di un amico nella lista
        updateFriendOnlineStatus: (
            state,
            action: PayloadAction<{ uid: string; isOnline: boolean }>
        ) => {
            const friend = state.friends.find((f) => f.uid === action.payload.uid);
            if (friend) {
                friend.isOnline = action.payload.isOnline;
            }
        },

        // Pulisci risultati ricerca
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchQuery = '';
            state.searchError = null;
        },

        // Reset errori
        clearFriendsErrors: (state) => {
            state.friendsError = null;
            state.requestsError = null;
            state.searchError = null;
        },
    },

    extraReducers: (builder) => {
        // LOAD FRIENDS
        builder
            .addCase(loadFriends.pending, (state) => {
                state.friendsLoading = true;
                state.friendsError = null;
            })
            .addCase(loadFriends.fulfilled, (state, action) => {
                state.friendsLoading = false;
                state.friends = action.payload;
            })
            .addCase(loadFriends.rejected, (state, action) => {
                state.friendsLoading = false;
                state.friendsError = action.payload as string;
            });

        // SEARCH USERS
        builder
            .addCase(searchUsers.pending, (state) => {
                state.isSearching = true;
                state.searchError = null;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.isSearching = false;
                state.searchResults = action.payload;
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.isSearching = false;
                state.searchError = action.payload as string;
            });

        // LOAD REQUESTS
        builder
            .addCase(loadFriendRequests.pending, (state) => {
                state.requestsLoading = true;
            })
            .addCase(loadFriendRequests.fulfilled, (state, action) => {
                state.requestsLoading = false;
                state.pendingRequests = action.payload.pending;
                state.sentRequests = action.payload.sent;
            })
            .addCase(loadFriendRequests.rejected, (state, action) => {
                state.requestsLoading = false;
                state.requestsError = action.payload as string;
            });

        // ACCEPT REQUEST
        builder.addCase(acceptFriendRequest.fulfilled, (state, action) => {
            state.pendingRequests = state.pendingRequests.filter(
                (r) => r.id !== action.payload
            );
        });

        // REJECT REQUEST
        builder.addCase(rejectFriendRequest.fulfilled, (state, action) => {
            state.pendingRequests = state.pendingRequests.filter(
                (r) => r.id !== action.payload
            );
        });

        // CANCEL REQUEST
        builder.addCase(cancelFriendRequest.fulfilled, (state, action) => {
            state.sentRequests = state.sentRequests.filter(
                (r) => r.id !== action.payload
            );
        });

        // REMOVE FRIEND
        builder.addCase(removeFriend.fulfilled, (state, action) => {
            state.friends = state.friends.filter((f) => f.uid !== action.payload);
        });

        // LOAD LOBBY INVITES
        builder
            .addCase(loadLobbyInvites.pending, (state) => {
                state.invitesLoading = true;
            })
            .addCase(loadLobbyInvites.fulfilled, (state, action) => {
                state.invitesLoading = false;
                state.lobbyInvites = action.payload;
            });

        // ACCEPT LOBBY INVITE
        builder.addCase(acceptLobbyInvite.fulfilled, (state, action) => {
            state.lobbyInvites = state.lobbyInvites.filter(
                (i) => i.id !== action.payload.inviteId
            );
        });

        // REJECT LOBBY INVITE
        builder.addCase(rejectLobbyInvite.fulfilled, (state, action) => {
            state.lobbyInvites = state.lobbyInvites.filter(
                (i) => i.id !== action.payload
            );
        });
    },
});

// Export azioni sincrone
export const {
    setFriendRequests,
    setLobbyInvites,
    updateFriendOnlineStatus,
    clearSearchResults,
    clearFriendsErrors,
} = friendsSlice.actions;

// Export reducer
export default friendsSlice.reducer;
