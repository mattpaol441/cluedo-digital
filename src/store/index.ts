import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import lobbyReducer from './slices/lobbySlice';


 // Redux Store Configuration: centralizza la configurazione dello store Redux
  
 // Architettura:
 // userSlice: Authentication + User Data (Firebase Auth)
 // uiSlice: UI State (Notifications, Theme, Modals)
 // lobbySlice: Lobby State (Game Browser, Matchmaking)
 // 
 // Nota Critica:
 // - GAME STATE non va in Redux! È gestito da BoardGame.io (G object)
 // - Redux è SOLO per App State (Meta-game)
 
 // Combina 3 slice independenti in un'unica source of truth
export const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    lobby: lobbyReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
