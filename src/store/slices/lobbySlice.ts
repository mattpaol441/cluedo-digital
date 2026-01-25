import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LobbyMatch, MatchCredentials, LobbyPlayer } from '../../services/lobbyClient';


/**
 * Lobby Slice: gestisce lo stato della Lobby e delle connessioni ai match
 * 
 * Contiene:
 * - Lista di partite disponibili
 * - Match corrente (se in lobby/gioco)
 * - Credenziali di connessione
 * - Giocatori in lobby con dati real-time
 * - Stato di join/creazione
 * 
 * Sincronizzato con:
 * - BoardGame.io Lobby API per creazione/join
 * - BoardGame.io Socket per aggiornamenti real-time
 * - Firebase per persistenza statistiche utente
 */

// ============================================
// TIPI DELLO STATO
// ============================================

export interface LobbyState {
  // ---- Lista partite disponibili ----
  availableMatches: LobbyMatch[];
  isLoadingMatches: boolean;
  matchesError: string | null;

  // ---- Match corrente ----
  currentMatch: LobbyMatch | null;
  isHost: boolean;
  
  // ---- Credenziali di connessione ----
  matchCredentials: MatchCredentials | null;
  
  // ---- Stato connessione ----
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionError: string | null;

  // ---- Operazioni in corso ----
  isCreatingMatch: boolean;
  createMatchError: string | null;
  isJoiningMatch: boolean;
  joinMatchError: string | null;
  isLeavingMatch: boolean;
  
  // ---- Polling stato lobby ----
  isPollingLobby: boolean;
}

// ============================================
// STATO INIZIALE
// ============================================

const initialState: LobbyState = {
  // Lista partite
  availableMatches: [],
  isLoadingMatches: false,
  matchesError: null,

  // Match corrente
  currentMatch: null,
  isHost: false,

  // Credenziali
  matchCredentials: null,

  // Connessione
  connectionStatus: 'disconnected',
  connectionError: null,

  // Operazioni
  isCreatingMatch: false,
  createMatchError: null,
  isJoiningMatch: false,
  joinMatchError: null,
  isLeavingMatch: false,
  
  // Polling
  isPollingLobby: false,
};

// ============================================
// SLICE
// ============================================

const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    // =========== LISTA MATCH ===========
    
    setLoadingMatches: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMatches = action.payload;
    },

    setAvailableMatches: (state, action: PayloadAction<LobbyMatch[]>) => {
      state.availableMatches = action.payload;
      state.isLoadingMatches = false;
      state.matchesError = null;
    },

    setMatchesError: (state, action: PayloadAction<string | null>) => {
      state.matchesError = action.payload;
      state.isLoadingMatches = false;
    },

    // =========== CREAZIONE MATCH ===========
    
    setCreatingMatch: (state, action: PayloadAction<boolean>) => {
      state.isCreatingMatch = action.payload;
      if (action.payload) {
        state.createMatchError = null;
      }
    },

    setCreateMatchError: (state, action: PayloadAction<string | null>) => {
      state.createMatchError = action.payload;
      state.isCreatingMatch = false;
    },

    // =========== JOIN MATCH ===========
    
    setJoiningMatch: (state, action: PayloadAction<boolean>) => {
      state.isJoiningMatch = action.payload;
      if (action.payload) {
        state.joinMatchError = null;
      }
    },

    setJoinMatchError: (state, action: PayloadAction<string | null>) => {
      state.joinMatchError = action.payload;
      state.isJoiningMatch = false;
    },

    // =========== MATCH CORRENTE ===========
    
    /**
     * Imposta il match corrente dopo creazione o join
     */
    setCurrentMatch: (state, action: PayloadAction<{ match: LobbyMatch; isHost: boolean }>) => {
      state.currentMatch = action.payload.match;
      state.isHost = action.payload.isHost;
      state.isCreatingMatch = false;
      state.isJoiningMatch = false;
    },

    /**
     * Aggiorna i dati del match corrente (es. quando un nuovo giocatore si unisce)
     */
    updateCurrentMatch: (state, action: PayloadAction<LobbyMatch>) => {
      state.currentMatch = action.payload;
    },

    /**
     * Aggiorna solo la lista giocatori del match corrente
     */
    updateMatchPlayers: (state, action: PayloadAction<LobbyPlayer[]>) => {
      if (state.currentMatch) {
        state.currentMatch.players = action.payload;
      }
    },

    // =========== CREDENZIALI ===========
    
    /**
     * Salva le credenziali dopo il join
     */
    setMatchCredentials: (state, action: PayloadAction<MatchCredentials>) => {
      state.matchCredentials = action.payload;
    },

    /**
     * Pulisce le credenziali (logout o leave)
     */
    clearMatchCredentials: (state) => {
      state.matchCredentials = null;
    },

    // =========== CONNESSIONE ===========
    
    setConnectionStatus: (state, action: PayloadAction<'disconnected' | 'connecting' | 'connected' | 'error'>) => {
      state.connectionStatus = action.payload;
      if (action.payload !== 'error') {
        state.connectionError = null;
      }
    },

    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionStatus = 'error';
      state.connectionError = action.payload;
    },

    // =========== LEAVE MATCH ===========
    
    setLeavingMatch: (state, action: PayloadAction<boolean>) => {
      state.isLeavingMatch = action.payload;
    },

    /**
     * Pulisce tutto lo stato relativo al match corrente
     */
    leaveCurrentMatch: (state) => {
      state.currentMatch = null;
      state.isHost = false;
      state.matchCredentials = null;
      state.connectionStatus = 'disconnected';
      state.connectionError = null;
      state.isLeavingMatch = false;
    },

    // =========== POLLING ===========
    
    setPollingLobby: (state, action: PayloadAction<boolean>) => {
      state.isPollingLobby = action.payload;
    },

    // =========== RESET ===========
    
    /**
     * Reset completo dello stato lobby
     */
    resetLobby: () => initialState,
  },
});

// ============================================
// SELECTORS
// ============================================

export const selectIsInLobby = (state: { lobby: LobbyState }) => 
  state.lobby.currentMatch !== null && state.lobby.connectionStatus !== 'connected';

export const selectIsInGame = (state: { lobby: LobbyState }) => 
  state.lobby.currentMatch !== null && state.lobby.connectionStatus === 'connected';

export const selectCanStartGame = (state: { lobby: LobbyState }) => {
  const match = state.lobby.currentMatch;
  if (!match || !state.lobby.isHost) return false;
  
  // Conta i giocatori che hanno fatto join (hanno un nome)
  const joinedPlayers = match.players.filter(p => p.name !== undefined);
  return joinedPlayers.length >= 3; // Minimo 3 giocatori per Cluedo
};

export const selectMatchCode = (state: { lobby: LobbyState }) => {
  const matchID = state.lobby.currentMatch?.matchID;
  if (!matchID) return null;
  return matchID; // Ritorna l'ID completo (case-sensitive)
};

export const selectJoinedPlayersCount = (state: { lobby: LobbyState }) => {
  const match = state.lobby.currentMatch;
  if (!match) return 0;
  return match.players.filter(p => p.name !== undefined).length;
};

// ============================================
// EXPORTS
// ============================================

export const {
  setLoadingMatches,
  setAvailableMatches,
  setMatchesError,
  setCreatingMatch,
  setCreateMatchError,
  setJoiningMatch,
  setJoinMatchError,
  setCurrentMatch,
  updateCurrentMatch,
  updateMatchPlayers,
  setMatchCredentials,
  clearMatchCredentials,
  setConnectionStatus,
  setConnectionError,
  setLeavingMatch,
  leaveCurrentMatch,
  setPollingLobby,
  resetLobby,
} = lobbySlice.actions;

export default lobbySlice.reducer;
