import type { Game } from 'boardgame.io';
import  type { 
    CluedoGameState, 
    SuspectCard, 
    WeaponCard, 
    RoomCard, 
    PlayerState 
} from '@cluedo-digital/shared';

// --- DATI FINTI PER IL SETUP INIZIALE ---
// Servono solo per far contento TypeScript finché non scriveremo la logica del mazzo
const DUMMY_SUSPECT: SuspectCard = { type: 'SUSPECT', id: 'mustard', name: 'Col. Mustard' };
const DUMMY_WEAPON: WeaponCard = { type: 'WEAPON', id: 'dagger', name: 'Pugnale' };
const DUMMY_ROOM: RoomCard = { type: 'ROOM', id: 'kitchen', name: 'Cucina' };

export const CluedoGame: Game<CluedoGameState> = {
  name: 'cluedo-digital',

  // SETUP: Deve ritornare un oggetto che corrisponde ESATTAMENTE a CluedoGameState
  setup: (ctx) => {
    
    // Inizializziamo i giocatori vuoti in base al numero di player nella lobby
    const initialPlayers: Record<string, PlayerState> = {};
    
    // ctx.numPlayers ci dice quanti giocatori ci sono (es. 3)
    // Creiamo lo stato iniziale per "0", "1", "2"...
    for (let i = 0; i <  Number(ctx.numPlayers); i++) {
        const playerId = i.toString();
        initialPlayers[playerId] = {
            id: playerId,
            name: `Player ${i + 1}`,
            color: '#000000', // Colore temporaneo
            character: 'mustard', // Personaggio temporaneo
            position: { x: 0, y: 0 }, // Posizione temporanea
            currentRoom: undefined,
            hand: [],
            notebook: {},
            isEliminated: false
        };
    }

    return {
      // ERRORE RISOLTO: Ora passiamo un oggetto, non un array
      secretEnvelope: {
        suspect: DUMMY_SUSPECT,
        weapon: DUMMY_WEAPON,
        room: DUMMY_ROOM
      },
      
      tableCards: [], // Array vuoto di Card[] va bene
      
      players: initialPlayers, // Passiamo i giocatori inizializzati
      
      diceRoll: [0, 0],
      currentSuggestion: undefined,
      isMoved: false
    };
  },

  moves: {
    clickCell: ({ G }, x, y) => {
      console.log('Click ricevuto:', x, y);
    },
  },

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
};