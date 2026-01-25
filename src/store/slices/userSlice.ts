import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserLoginEmail
} from '../../firebase/users';
import { translateFirebaseError } from '../../utils/errorMapper';
import type { UserProfile } from '../../types';



// User Slice: gestisce l'autenticazione e i dati dell'utente
 
// Contiene:
// - Stato di autenticazione (loggedIn, loading)
// - Dati utente (uid, email, displayName)
// - Statistiche di gioco
 
// Note:
// - I dati sono serializzabili (no funzioni, no Date objects non processate)
// - Viene sincronizzato con Firebase Authentication + Firestore
// - Usa Thunk per operazioni asincrone


// STATO 

export interface UserState {
  // Autenticazione
  isLoggedIn: boolean;
  isLoading: boolean;
  authError: string | null;

  // Dati Utente (da Firebase Auth + Firestore)
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isOnline: boolean;

  // Statistiche (da Firestore)
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
  };

  // Meta
  lastLoginTime: number | null;
  profileLoaded: boolean;
}

const initialState: UserState = {
  isLoggedIn: false,
  isLoading: false,
  authError: null,
  uid: '',
  email: '',
  displayName: '',
  avatarUrl: '',
  isOnline: false,
  stats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0
  },
  lastLoginTime: null,
  profileLoaded: false
};

// THUNKS (Azioni Asincrone) 

// Registra un nuovo utente 
export const registerUser = createAsyncThunk(
  'user/register',
  async (
    { email, password, displayName }: { email: string; password: string; displayName: string },
    { rejectWithValue }
  ) => {
    try {
      // 1. Chiama la funzione di users.ts per registrare su Firebase Auth
      const authUser = await registerWithEmail(email, password, displayName);

      // 2. Crea profilo su Firestore tramite la funzione di users.ts
      await createUserProfile(authUser.uid, email, displayName);

      // 3. Carica il profilo appena creato (users.ts)
      const profile = await getUserProfile(authUser.uid);

      // 4. Ritorna dati completi per Redux
      return {
        uid: authUser.uid,
        email: authUser.email || email,
        displayName: displayName,
        avatarUrl: profile?.avatarUrl || '',
        stats: profile?.stats || { gamesPlayed: 0, wins: 0, losses: 0 }
      };
    } catch (error) {
      return rejectWithValue(translateFirebaseError(error));
    }
  }
);

// Login con email e password 
export const loginUser = createAsyncThunk(
  'user/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // 1. Autenticazione chiamando la funzione di users.ts
      const authUser = await loginWithEmail(email, password);

      // 2. Carica profilo completo da Firestore
      const profile = await getUserProfile(authUser.uid);

      // 3. Ritorna dati combinati che finiranno nello stato Redux
      return {
        uid: authUser.uid,
        email: authUser.email || email,
        displayName: profile?.displayName || authUser.displayName || email,
        avatarUrl: profile?.avatarUrl || '',
        stats: profile?.stats || { gamesPlayed: 0, wins: 0, losses: 0 }
      };
    } catch (error) {
      return rejectWithValue(translateFirebaseError(error));
    }
  }
);

// Logout 
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Chiama la funzione di users.ts per fare logout su Firebase
      await logout();
      return true;
    } catch (error) {
      return rejectWithValue(translateFirebaseError(error));
    }
  }
);

// Carica profilo utente (per sessioni persistenti / observer) 
export const loadUserProfile = createAsyncThunk(
  'user/loadProfile',
  async (uid: string, { rejectWithValue }) => {
    try {
      const profile = await getUserProfile(uid);
      if (!profile) {
        return rejectWithValue('Profilo non trovato');
      }
      return profile;
    } catch (error) {
      return rejectWithValue(translateFirebaseError(error));
    }
  }
);

// Aggiorna profilo utente 
export const updateUserProfileThunk = createAsyncThunk(
  'user/updateProfile',
  async (
    { uid, updates }: { uid: string; updates: Partial<UserProfile> }, 
    { rejectWithValue }
  ) => {
    try {
      // Se c'è una nuova email, aggiorniamo prima l'Auth (Login)
      if (updates.email) {
        await updateUserLoginEmail(updates.email);
      }
      // Chiama la funzione di users.ts per aggiornare il profilo su Firestore
      await updateUserProfile(uid, updates);
      return updates;
    } catch (error: any) {
      // Gestione specifica errore "Login Recente Richiesto"
      if (error.code === 'auth/requires-recent-login') {
        return rejectWithValue("Per questioni di sicurezza, devi fare logout e login prima di cambiare email.");
      }
      return rejectWithValue(translateFirebaseError(error));
    }
  }
);

// SLICE 

const userSlice = createSlice({
  name: 'user',
  initialState,

  // Reducers sincroni (per azioni immediate)
  reducers: {
    // Usato dall'observer di Firebase Auth (in App.tsx)
    setUserFromAuth: (
      state,
      action: PayloadAction<{
        uid: string;
        email: string;
        displayName: string;
      }>
    ) => {
      state.isLoggedIn = true;
      state.isLoading = false;
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.isOnline = true;
    },

    // Reset completo dello stato
    clearUser: () => {
      return initialState;
    },

    // Pulisce errori di autenticazione
    clearAuthError: (state) => {
      state.authError = null;
    }
  },

  // Extra Reducers per gestire i thunks
  extraReducers: (builder) => {
    // REGISTER 
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.uid = action.payload.uid;
        state.email = action.payload.email;
        state.displayName = action.payload.displayName;
        state.avatarUrl = action.payload.avatarUrl;
        state.stats = action.payload.stats;
        state.lastLoginTime = Date.now();
        state.profileLoaded = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
      });

    // LOGIN 
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.uid = action.payload.uid;
        state.email = action.payload.email;
        state.displayName = action.payload.displayName;
        state.avatarUrl = action.payload.avatarUrl;
        state.stats = action.payload.stats;
        state.lastLoginTime = Date.now();
        state.profileLoaded = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
      });

    // LOGOUT 
    builder
      .addCase(logoutUser.fulfilled, () => {
        return initialState;
      });

    // LOAD PROFILE 
    builder
      .addCase(loadUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.displayName = action.payload.displayName;
        state.avatarUrl = action.payload.avatarUrl || '';
        state.stats = action.payload.stats;
        state.profileLoaded = true;
      })
      .addCase(loadUserProfile.rejected, (state) => {
        state.isLoading = false;
      });

    // UPDATE PROFILE 
    builder
      .addCase(updateUserProfileThunk.fulfilled, (state, action) => {
        if (action.payload.displayName) {
          state.displayName = action.payload.displayName;
        }
        if (action.payload.avatarUrl) {
          state.avatarUrl = action.payload.avatarUrl;
        }
        
        if (action.payload.email) {
          state.email = action.payload.email;
        }
      });
  }
});

// Export azioni sincrone
export const {
  setUserFromAuth,
  clearUser,
  clearAuthError
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
