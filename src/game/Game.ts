// Game.ts definisce le regole (la matematica del gioco)
import type { Game } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/dist/cjs/core.js'; // Importiamo questo helper

export interface CluedoGameState {
  cells: (string | null)[];
}

export const CluedoGame: Game<CluedoGameState> = {
  name: 'cluedo-digital',

  setup: () => ({
    cells: Array(9).fill(null),
  }),

  moves: {
    // Aggiungiamo 'events' agli argomenti della mossa
    clickCell: ({ G, playerID, events }, id: number) => {
      // Regola: Non puoi sovrascrivere una casella già piena
      if (G.cells[id] !== null) {
        return INVALID_MOVE;
      }

      // 1. Applica la modifica allo stato
      G.cells[id] = playerID;

      // 2. PASSA IL TURNO AUTOMATICAMENTE
      events.endTurn(); 
    },
  },
  
  minPlayers: 3,
  maxPlayers: 6,
};