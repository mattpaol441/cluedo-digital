import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import lobbyReducer from './slices/lobbySlice';
import friendsReducer from './slices/friendsSlice';


// Redux Store Configuration: centralizza la configurazione dello store Redux

// Architettura:
// userSlice: Authentication + User Data (Firebase Auth)
// uiSlice: UI State (Notifications, Theme, Modals)
// lobbySlice: Lobby State (Game Browser, Matchmaking)
// friendsSlice: Friends, Requests, Lobby Invites
// 
// Nota Critica:
// - GAME STATE non va in Redux! È gestito da BoardGame.io (G object)
// - Redux è SOLO per App State (Meta-game)

// Combina i diversi slice indipendenti in un'unica source of truth
// Quindi stiamo dicendo di costruire lo store con i diversi slice, dividendo in "settori" ognuno con la sua responsabilità specifica
// Le slices infatti servono a separare le responsabilità e mantenere il codice modulare, come se fossero diversi "reparti" che si occupano di aspetti specifici dell'applicazione.  
export const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    lobby: lobbyReducer,
    friends: friendsReducer,
  },
});


// Queste due righe aiutano TypeScript a controllare che usiamo lo store e le azioni in modo corretto, prevenendo bug e rendendo il codice più sicuro e facile da mantenere.
// Qui stiamo dicendo di memorizzare (o di conoscere) la forma dello store, ricordando quali sono le diverse parti/sezioni (slices) disponibili in esso e impedendo di leggerne di non definite.
export type RootState = ReturnType<typeof store.getState>;
// Qui stiamo dicendo di memorizzare (o conoscere) quali azioni possono essere inviate allo store (basandosi sulle azioni definite nei vari slice), e avere aiuto da TypeScript per evitare errori.
export type AppDispatch = typeof store.dispatch; // // Inoltre, questo serve per far sì che useDispatch lavori da "postino" in grado di accettare sia "buste" normali che "buste" speciali (thunk functions, ovvero funzioni async che fanno operazioni asincrone prima di spedire l'azione vera e propria)
