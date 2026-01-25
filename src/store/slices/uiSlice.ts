import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


// UI Slice: gestisce lo stato dell'interfaccia utente (tema, visibilità modali, loading)

// Contiene:
// - Tema/Preferenze visive
// - Modal visibility states
// - Loading states globali
// 
// Note:
// - Separato da Game State (che è in BoardGame.io)
// - Separato da User State (che è in userSlice)
// - I toast sono gestiti direttamente con react-hot-toast (non passano da Redux)


export interface UIState {
  // Tema
  isDarkMode: boolean;

  // Modal/Dialog
  modalsOpen: Record<string, boolean>;

  // Loading globale
  isGlobalLoading: boolean;
}

const initialState: UIState = {
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
  toggleDarkMode,
  setDarkMode,
  openModal,
  closeModal,
  toggleModal,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
