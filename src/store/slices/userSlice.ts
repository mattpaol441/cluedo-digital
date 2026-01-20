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
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;

  // Session
  lastLoginTime: number | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  isLoading: false,
  authError: null,
  uid: '',
  email: '',
  displayName: '',
  isOnline: false,
  avatarUrl: undefined,
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
      state.uid = '';
      state.email = '';
      state.displayName = '';
      state.lastLoginTime = null;
    },

    // Gestisce errori 
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.authError = action.payload;
      state.isLoading = false;
    },

    // Aggiorna il profilo
    updateProfile: ( state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },

    // Aggiorna l'immagine profilo
    updateAvatar: (state, action: PayloadAction<string>) => {
      state.avatarUrl = action.payload;
    },
  },
});

export const {
  setAuthLoading,
  setUserLoggedIn,
  setUserLoggedOut,
  setAuthError,
  updateProfile,
  updateAvatar,
} = userSlice.actions;

export default userSlice.reducer;
