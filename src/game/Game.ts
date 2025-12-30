import type { Game } from 'boardgame.io';
// import { INVALID_MOVE } from 'boardgame.io/dist/cjs/core.js'; // Importiamo questo helper

import { 
  type CluedoGameState,
  type Player,
  type Card, 
  type SuspectID,
  type SuspectCard, 
  type WeaponCard,
  type RoomCard,
} from "@cluedo-digital/shared";



import { 
  SUSPECTS, 
  WEAPONS, 
  ROOMS,
  CHARACTER_COLORS,
  ALL_CARDS
} from "@cluedo-digital/shared";





import { 
  SUSPECT_START_COORDS
} from "@cluedo-digital/shared";

// Funzione per distribuire le carte
const dealCards = (random: any, numPlayers: number): {secretEnvelope: Card[], playerHands: Card[][], tableCards: Card[]} => {
  // Creiamo copie dei mazzi per non modificare le costanti originali
  const suspects = [...SUSPECTS];
  const weapons = [...WEAPONS];
  const rooms = [...ROOMS];

  // Mescoliamo i singoli mazzi con la funzione random di BoardGame.io per far sì che tutti vedano le stesse carte
  const shuffledSuspects = random.Shuffle(suspects);
  const shuffledWeapons = random.Shuffle(weapons);
  const shuffledRooms = random.Shuffle(rooms);

  // Estraiamo la Soluzione dai mazzi mischiati randomicamente (1 per tipo)
  const secretEnvelope = [
    shuffledSuspects.pop()!, // Rimuove l'ultimo e lo prende
    shuffledWeapons.pop()!,
    shuffledRooms.pop()!
  ];

  // Uniamo tutto il resto in un unico mazzo "Indizi"
  let allRemainingCards = [
    ...shuffledSuspects,
    ...shuffledWeapons,
    ...shuffledRooms
  ];

  // Mescoliamo anche il mazzo gigante appena creato
  allRemainingCards = random.Shuffle(allRemainingCards);

  // Inizializzazione delle mani vuote dei giocatori:
  // Costruzione di un array di array vuoti, uno per ogni giocatore.
  // Array(numPlayers) crea un array lungo numPlayers, e fill([]) riempie i buchi con un array vuoto ma lo fa mettendo lo stesso identico array in tutti i buchi. 
  // Così le carte di un giocatore verrebbero condivise con tutti gli altri giocatori, quindi uso map che scorre ogni elemento e sostituisce il contenuto eseguendo la funzione () => [] che 
  // crea un NUOVO array vuoto per ogni posizione. In questo modo ogni giocatore ha la sua mano separata.
  const playerHands: Card[][] = Array(numPlayers).fill([]).map(() => []); 

  const tableCards: Card[] = []; // Carte che andranno sul tavolo se non distribuite

  // Distribuiamo le carte una alla volta (Round Robin)
  let playerIndex = 0;
  while (allRemainingCards.length > 0) {
    // Se le carte rimaste sono meno dei giocatori, vanno sul tavolo (resto, come le regole richiedono)
    // Esempio: 4 giocatori totali, 2 carte rimaste, queste vanno sul tavolo
    if (allRemainingCards.length < numPlayers && playerHands[0].length === playerHands[playerIndex].length) { // Se non ci sono abbastanza carte per fare un altro giro completo per tutti e i giocatori hanno lo stesso numero di carte finora (per evitare di mettere carte sul tavolo a metà di un giro di distribuzione)
       tableCards.push(...allRemainingCards);
       break;
    }
    // Se invece abbiamo abbastanza carte, distribuiamo la prossima carta al giocatore corrente
    const card = allRemainingCards.pop()!; // Prende l'ultima carta
    playerHands[playerIndex].push(card); // La dà al giocatore corrente
    
    // Passa al prossimo giocatore (ciclico)
    playerIndex = (playerIndex + 1) % numPlayers; // Serve a passare al giocatore successivo e "tornare a capo" quando finiscono
  }

  return { secretEnvelope, playerHands, tableCards };
};





// --- DEFINIZIONE DEL GIOCO ---

export const CluedoGame: Game<CluedoGameState> = {
  name: 'cluedo-digital',

  // Configurazione Iniziale della partita
  setup: ({ ctx, random }): CluedoGameState => {
    const numPlayers = ctx.numPlayers;

    // Distribuzione carte
    const dealt = dealCards(random, numPlayers);

    // Creazione giocatori
    const players: Record<string, Player> = {};
    
    // Assegniamo i personaggi in ordine basato su SUSPECTS: Player 0 = Miss Scarlet, Player 1 = Peacock ecc.
    for (let i = 0; i < numPlayers; i++) {
      const suspectDef = SUSPECTS[i]; // Prende il sospettato corrispondente all'indice
      const pID = i.toString();

      players[pID] = {
        id: pID,
        name: `Giocatore ${i + 1}`, // Nome temporaneo, poi arriverà dalla Lobby
        character: suspectDef.id as SuspectID,
        color: CHARACTER_COLORS[suspectDef.id as SuspectID],
        
        // Assegniamo la mano calcolata prima
        hand: dealt.playerHands[i],
        
        // Posizione iniziale dalla mappa
        // position: STARTING_POSITIONS[suspectDef.id as SuspectID], COMMENTATO PER ORA
        position: SUSPECT_START_COORDS[suspectDef.id as SuspectID],
        
        isEliminated: false,
        wasMovedBySuggestion: false, // All'inizio nessuno è stato trascinato
        currentRoom: undefined,
      };
    }

    // C. Ritorna lo Stato Iniziale Completo ($G)
    return {
      // secretEnvelope: dealt.secretEnvelope,
      // secretEnvelope: {
      //   suspect: dealt.secretEnvelope[0],
      //   weapon: dealt.secretEnvelope[1],
      //   room: dealt.secretEnvelope[2]
      // },
      secretEnvelope: dealt.secretEnvelope,
      tableCards: dealt.tableCards,
      players: players,
      diceRoll: [0, 0], // Dadi non ancora lanciati
      currentSuggestion: null,
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
  
  // // Condizioni di vittoria/fine
  // endIf: (G, ctx) => {
  //   // Logica vittoria (da implementare dopo)
  // }
};