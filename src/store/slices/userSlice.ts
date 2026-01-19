import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


 // User Slice: gestisce l'autenticazione e i dati dell'utente
  
 // Contiene:
 // - Stato di autenticazione (loggedIn, loading)
 // - Dati utente (uid, email, displayName)
 // - Info/Token di sessione (se necessario)
 // 
 // Note:
 // - I dati sono serializzabili (no funzioni, no Date objects non processate)
 // - Viene sincronizzato con Firebase Authentication
 // - Persiste tra le sessioni (localStorage tramite middleware custom, se necessario)
 

export interface UserState {
  // Autenticazione
  isLoggedIn: boolean;
  isLoading: boolean;
  authError: string | null;

  // Dati Utente
  uid: string | null;
  email: string | null;
  displayName: string | null;

  // Session
  lastLoginTime: number | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  isLoading: false,
  authError: null,
  uid: null,
  email: null,
  displayName: null,
  lastLoginTime: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // AZIONI DI CARICAMENTO durante l'autenticazione
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Salva uid/email dopo autenticazione Firebase
    setUserLoggedIn: (
      state,
      action: PayloadAction<{
        uid: string;
        email: string;
        displayName?: string;
      }>
    ) => {
      state.isLoggedIn = true;
      state.isLoading = false;
      state.authError = null;
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName || action.payload.email;
      state.lastLoginTime = Date.now();
    },

    // Pulisce tutto al logout 
    setUserLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.authError = null;
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.lastLoginTime = null;
    },

    // Gestisce errori 
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.authError = action.payload;
      state.isLoading = false;
    },

    // UPDATE PROFILO 
    updateUserDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload;
    },
  },
});

export const {
  setAuthLoading,
  setUserLoggedIn,
  setUserLoggedOut,
  setAuthError,
  updateUserDisplayName,
} = userSlice.actions;

export default userSlice.reducer;
