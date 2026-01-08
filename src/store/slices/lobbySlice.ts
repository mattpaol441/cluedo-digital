import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


 // Lobby Slice: gestisce lo stato della Lobby 
  
 // Contiene:
 // - Lista di partite disponibili
 // - Partita selezionata
 // - Giocatori in lobby
 // - Stato di join/creazione
 // 
 // Note:
 // - Questo è uno stub per future implementazione
 // - Sarà sincronizzato con Firestore + WebSocket
 // - Attualmente non usato (prepariamo la struttura)
 

export interface LobbyGame {
  id: string;
  name: string;
  host: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export interface LobbyState {
  // Lista partite
  availableGames: LobbyGame[];
  isLoadingGames: boolean;
  gamesError: string | null;

  // Partita selezionata / Creazione
  selectedGameId: string | null;
  isCreatingGame: boolean;
  createGameError: string | null;

  // Join
  isJoiningGame: boolean;
  joinGameError: string | null;
}

const initialState: LobbyState = {
  availableGames: [],
  isLoadingGames: false,
  gamesError: null,
  selectedGameId: null,
  isCreatingGame: false,
  createGameError: null,
  isJoiningGame: false,
  joinGameError: null,
};

const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    // CARICA PARTITE
    setLoadingGames: (state, action: PayloadAction<boolean>) => {
      state.isLoadingGames = action.payload;
    },

    // Lista partite da Firestore
    setAvailableGames: (state, action: PayloadAction<LobbyGame[]>) => {
      state.availableGames = action.payload;
      state.isLoadingGames = false;
      state.gamesError = null;
    },

    setGamesError: (state, action: PayloadAction<string | null>) => {
      state.gamesError = action.payload;
      state.isLoadingGames = false;
    },

    // SELEZIONA PARTITA
    selectGame: (state, action: PayloadAction<string>) => {
      state.selectedGameId = action.payload;
    },

    deselectGame: (state) => {
      state.selectedGameId = null;
    },

    // CREA PARTITA
    setCreatingGame: (state, action: PayloadAction<boolean>) => {
      state.isCreatingGame = action.payload;
    },

    setCreateGameError: (state, action: PayloadAction<string | null>) => {
      state.createGameError = action.payload;
      state.isCreatingGame = false;
    },

    // JOIN PARTITA
    setJoiningGame: (state, action: PayloadAction<boolean>) => {
      state.isJoiningGame = action.payload;
    },

    setJoinGameError: (state, action: PayloadAction<string | null>) => {
      state.joinGameError = action.payload;
      state.isJoiningGame = false;
    },

    // Reset totale
    resetLobby: () => initialState,
  },
});

export const {
  setLoadingGames,
  setAvailableGames,
  setGamesError,
  selectGame,
  deselectGame,
  setCreatingGame,
  setCreateGameError,
  setJoiningGame,
  setJoinGameError,
  resetLobby,
} = lobbySlice.actions;

export default lobbySlice.reducer;
