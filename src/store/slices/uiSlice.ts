import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


 // UI Slice: gestisce lo stato dell'interfaccia utente, i dati volatili dell'UI (notifiche, tema, visibilità modali)
  
 // Contiene:
 // - Notifiche globali (Toast)
 // - Tema/Preferenze visive
 // - Modal visibility states
 // - Loading states globali
 // 
 // Note:
 // - Separato da Game State (che è in BoardGame.io)
 // - Separato da User State (che è in userSlice)
 // - Questo è il "meta-game UI state" per notifiche, dialoghi, tema, etc.
 

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // ms, undefined = indefinite
  timestamp: number;
}

export interface UIState {
  // Notifiche
  notifications: Notification[];

  // Tema
  isDarkMode: boolean;

  // Modal/Dialog
  modalsOpen: Record<string, boolean>;

  // Loading globale
  isGlobalLoading: boolean;
}

const initialState: UIState = {
  notifications: [],
  isDarkMode: false,
  modalsOpen: {
    settings: false,
    help: false,
    confirmExit: false,
  },
  isGlobalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toast notifications globali
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // TEMA
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },

    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },

    // Gestione modali
    openModal: (state, action: PayloadAction<string>) => {
      state.modalsOpen[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modalsOpen[action.payload] = false;
    },

    toggleModal: (state, action: PayloadAction<string>) => {
      state.modalsOpen[action.payload] = !state.modalsOpen[action.payload];
    },

    // LOADING GLOBALE
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  toggleDarkMode,
  setDarkMode,
  openModal,
  closeModal,
  toggleModal,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
