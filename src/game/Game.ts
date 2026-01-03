import type { Game } from 'boardgame.io';

import { 
  type CluedoGameState,
  type Player,
  type Card, 
  type SuspectID,
  type RoomID, 
  type WeaponID,
 // type SuspectCard, 
 // type WeaponCard,
 // type RoomCard,
  CELL_TYPES,
} from "@cluedo-digital/shared";



import { 
  SUSPECTS, 
  WEAPONS, 
  ROOMS,
  CHARACTER_COLORS,
//  ALL_CARDS
} from "@cluedo-digital/shared";

import { 
  DOOR_MAPPING,
  BOARD_LAYOUT
 } from '@cluedo-digital/shared';



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
      const suspectDef = SUSPECTS[i];
      const pID = i.toString();

      players[pID] = {
        id: pID,
        name: `Giocatore ${i + 1}`,
        character: suspectDef.id as SuspectID,
        color: CHARACTER_COLORS[suspectDef.id as SuspectID],

        // Assegniamo la mano calcolata prima
        hand: dealt.playerHands[i],

        // Posizione iniziale dalla mappa
        position: SUSPECT_START_COORDS[suspectDef.id as SuspectID],
        
        isEliminated: false,
        wasMovedBySuggestion: false, // All'inizio nessuno è stato trascinato
        currentRoom: undefined, 
      };

      // // --- DEBUG TEST: TELEPORT MODE ---
      // // Forziamo SOLO il primo giocatore direttamente nella stanza centrale per vedere che i modali funzionano
      // if (i === 0) {
      //     console.log("[DEBUG] Teletrasporto Player 0 al Centro!");
      //     players[pID].currentRoom = 'CENTER_ROOM'; 
          
      //     // Opzionale: Se vuoi che anche visivamente la pedina sia al centro
      //     // (assumendo che il centro sia x:12, y:12 o simile nella tua griglia)
      //     // players[pID].position = { x: 12, y: 12 }; 
      // }
      // // -----------------------------------
    }

    // C. Ritorna lo Stato Iniziale Completo (G)
    return {
      secretEnvelope: dealt.secretEnvelope,
      tableCards: dealt.tableCards,
      players: players,
      diceRoll: [0, 0], 
      currentSuggestion: null,
      };
  },









   moves: { // NOTA IMPORTANTE: per le azioni che vengono proibite a giocatori eliminati, il controllo va fatto qui dentro, non nel frontend. Il frontend è solo un'interfaccia utente, il vero "cervello" del gioco è qui.
    // In particolare, viene proibita ogni mossa, ad eccezione di revealCard (per mostrare le carte agli altri giocatori e quindi smentire le iptesi altrui)
    movePawn: ({ G , ctx, events }, x: number, y: number) => {

      const playerID = ctx.currentPlayer;
      const player = G.players[playerID];
      // Se il Player è eliminato, blocchiamo il movimento 
      if (player.isEliminated) return 'INVALID_MOVE';

      // 2. BLOCCO MOVIMENTI MULTIPLI (Stop Obbligatorio)
      // Se hai già mosso 1 volta in questo turno, non puoi muovere ancora! Ciò non vuol dire che non puoi fare altre azioni, ma solo che il movimento è limitato a 1 per turno.
      if ((ctx.numMoves ?? 0) > 0) {
        return 'INVALID_MOVE';
      }


      // FIX BUG CLICK STESSA CASELLA
      // BLOCCO MOSSA NULLA:
      // Se le coordinate di destinazione (x, y) sono identiche a quelle attuali,
      // annulliamo l'azione. In questo modo boardgame.io NON incrementa numMoves.
      if (player.position.x === x && player.position.y === y) {
          console.warn("Mossa ignorata: Clic sulla stessa casella.");
          return 'INVALID_MOVE'; 
      }
    // -------------------------------------------


      const cellType = BOARD_LAYOUT[y][x];

      // I muri sono proibiti, non ci si può muovere lì, quindi li blocchiamo subito
      // Tutto il resto, ovvero HALL, DOOR, START, CENTER va bene
      if  (cellType === CELL_TYPES.VOID) {
        return 'INVALID_MOVE'; 
      }

      // Definiamo le zone dove si può stare in tanti, quindi dove è consentita la sovrapposizione (Safe Zones)
      // Consentita se è una di queste celle:
      const canStack = (
        cellType === CELL_TYPES.CENTER || // Al centro è fondamentale, perchè se un player fa l'accusa finale e sbaglia allora viene eliminato ma rimane al centro, quindi se non fosse consentita la sovrapposizione gli altri non potrebbero più andarci e fare l'accusa finale
        cellType === CELL_TYPES.DOOR      // Sulle porte si deve poter stare in tanti, per facilitare l'ingresso/uscita dalle stanze
      );
    
      if (!canStack) { // // Controllo se c'è qualcuno (ignorando me stesso)
      // Nota: È importante decidere se i giocatori eliminati bloccano il passaggio.
      // Di solito in Cluedo digitale, se uno è eliminato la sua pedina sparisce o diventa trasparente.
      // Qui controlliamo solo se c'è una collisione fisica sui dati.
        const isOccupied = Object.values(G.players).some((p: any) => 
          p.id !== ctx.currentPlayer && 
          p.position.x === x &&         
          p.position.y === y
          // !p.isEliminated // OPZIONALE: Se vuoi che i morti non blocchino i corridoi, scommenta questa riga            
        );
        if (isOccupied) return 'INVALID_MOVE'; 
      }

      // Aggiorna la posizione del giocatore
      player.position = { x, y };

      // 4. GESTIONE SPECIFICA DEL CENTRO (ACCUSA FINALE)
      if (cellType === CELL_TYPES.CENTER) {
        console.log("Il giocatore è entrato nella Busta Gialla (Centro)!");
        
        // Assegniamo una 'stanza fittizia' per attivare la UI dell'Accusa
        player.currentRoom = 'CENTER_ROOM'; 
        
        // Il giocatore deve ora avere il tempo di selezionare le carte e fare l'accusa.
        return; 
      }

      const coordKey = `${x},${y}`;
      if (DOOR_MAPPING[coordKey]) {
        player.currentRoom = DOOR_MAPPING[coordKey];
        console.log(`Player ${player.name} è entrato nella stanza: ${player.currentRoom}`); // Qui non deve chiudere il turno, perché dopo essersi mosso in una stanza il giocatore deve poter formulare un'ipotesi 
      }

      else {
        player.currentRoom = undefined; // In corridoio
        console.log('Movimento in corridoio completato.');
        
        // In corridoio non c'è altro da fare, passo il turno
        events.endTurn();
      }
    },






    makeAccusation: ({ G, ctx, events }, suspectId: string, weaponId: string, roomId: string) => { // La funzione riceve i 3 ID che arrivano dal modale (suspectId, weaponId, roomId)
      const playerID = ctx.currentPlayer;
      const player = G.players[playerID];
      // Se il Player è eliminato, blocchiamo nuove accuse 
      if (player.isEliminated) return 'INVALID_MOVE';

      console.log(`[SERVER] Accusa ricevuta da ${player.name}:`, { suspectId, weaponId, roomId });

      // 1. Recuperiamo la Soluzione dalla Busta Gialla
      // G.secretEnvelope è un array di 3 oggetti Card (inizializzato sopra, nel setup)
      const envelope = G.secretEnvelope;

      // 2. Verifichiamo se le carte corrispondono
      // Controlliamo se l'ID ricevuto esiste tra le carte della busta
      const isSuspectCorrect = envelope.some(card => card.id === suspectId);
      const isWeaponCorrect = envelope.some(card => card.id === weaponId);
      const isRoomCorrect = envelope.some(card => card.id === roomId);

      // 3. Logica di Vittoria o Sconfitta
      if (isSuspectCorrect && isWeaponCorrect && isRoomCorrect) {
        // --- VITTORIA ---
        console.log(`[SERVER] VITTORIA! ${player.name} ha risolto il caso.`);
        
        // Termina immediatamente la partita dichiarando il vincitore.
        // Passiamo anche la soluzione per poterla mostrare a tutti nella schermata di Game Over.
        events.endGame({
          winner: playerID,
          solution: { suspectId, weaponId, roomId }
        });

      } else {
        // --- SCONFITTA (ELIMINAZIONE) ---
        console.log(`[SERVER] Accusa ERRATA. ${player.name} è eliminato.`);

        // A. Marchiamo il giocatore come eliminato
        // Questo è fondamentale: impedisce al frontend di mostrare ancora il modale
        // e impedirà al giocatore di muoversi nei turni futuri (se gestisci il check su movePawn).
        player.isEliminated = true;

        // B. (Opzionale) Messaggio nel log di gioco pubblico
        // G.log.push({ type: 'elimination', player: player.name, message: 'ha sbagliato l\'accusa ed è stato eliminato.' });

        // C. Passiamo il turno
        // Il giocatore non può fare altro, il suo turno finisce qui per sempre.
        events.endTurn();
      }
    },
  





      makeHypothesis: ({ G, ctx, events }, suspectId: string, weaponId: string) => {
        const playerID = ctx.currentPlayer;
        const player = G.players[playerID];

        // I giocatori eliminati non possono fare ipotesi 
        if (player.isEliminated) {
            return 'INVALID_MOVE';
        }

        const currentRoom = player.currentRoom;

        // Deve essere fisicamente in una stanza vera 
        if (!currentRoom || currentRoom === 'CENTER_ROOM') {
            return 'INVALID_MOVE'; 
        }

        // CONTROLLO LEGITTIMITÀ DELL'IPOTESI
        // Regola: Puoi fare ipotesi SOLO se ti sei mosso in questo turno OPPURE 
        // se sei stato trascinato qui da un avversario ("wasMovedBySuggestion").
        // Se eri già qui dall'inizio del turno e nessuno ti ha toccato, devi uscire muovendoti.
        
        const hasMovedThisTurn = (ctx.numMoves ?? 0) > 0;
        const wasDraggedHere = player.wasMovedBySuggestion;

        if (!hasMovedThisTurn && !wasDraggedHere) {
            console.warn("Mossa illegale, devi muoverti prima di fare un'ipotesi se eri già nella stanza.");
            return 'INVALID_MOVE';
        }

        // SE SIAMO QUI, L'IPOTESI È VALIDA

        // SALVIAMO L'IPOTESI NELLO STATO DI GIOCO
        const nextPlayerID = (parseInt(playerID) + 1) % ctx.numPlayers;
        
        G.currentSuggestion = {
            accuserPlayerId: playerID,
            suspect: suspectId as SuspectID, 
            weapon: weaponId as WeaponID,
            room: currentRoom as RoomID,  //  La stanza è obbligata
            
            refutedBy: null,
            refutationCard: null,
            currentResponder: nextPlayerID.toString() 
        };

        console.log(`IPOTESI REGISTRATA: ${player.name} accusa ${suspectId} in ${currentRoom}`);

        // 5. TELETRASPORTO DEL SOSPETTATO (UC3 - Scenario Principale) 
        const accusedPlayerKey = Object.keys(G.players).find(
            key => G.players[key].character === suspectId
        );

        if (accusedPlayerKey) {
            const accusedPlayer = G.players[accusedPlayerKey];

            // VERIFICA: Il sospettato è già qui?
            const isAlreadyHere = accusedPlayer.currentRoom === currentRoom;
            
            // Spostiamo il sospettato
            accusedPlayer.currentRoom = currentRoom;
            accusedPlayer.position = { ...player.position }; 
            
            // REGOLA CRITICA:
            // Il flag "wasMovedBySuggestion" (che dà diritto a non muoversi al prossimo turno)
            // si attiva SOLO se il giocatore è stato effettivamente trascinato da altrove.
            // Se era già nella stanza, non riceve nessun bonus.
            if (!isAlreadyHere) {
                accusedPlayer.wasMovedBySuggestion = true;
                console.log(`🚀 TELETRASPORTO: ${accusedPlayer.name} trascinato in ${currentRoom}`);
            } else {
                console.log(`ℹ️ ${accusedPlayer.name} era già nella stanza. Nessun bonus movimento.`);
            }
        }

        // 6. GESTIONE ARMA (Opzionale ma coreografica)
        // Se volessimo gestire anche la posizione dell'arma (non obbligatorio per la logica, ma bello visivamente), lo faremmo qui.

        // 7. FINE FASE ATTIVA
        // Il turno non finisce, ma entra nella fase "Smentita".
        // Per ora, nei test, potremmo lasciare endTurn(), ma ricordiamo di toglierlo quando implementiamo la smentita.
        events.endTurn(); // TEMPORANEO PER TEST
      },
 },







  turn: {
    //INIZIO TURNO (setup e controlli)
    onBegin: ({ G, ctx, events }) => {
      // Pulizia Dati del Turno Precedente
      // È fondamentale pulire l'ipotesi vecchia, altrimenti il nuovo giocatore
      // potrebbe vedere i dati dell'accusa di quello prima.
      G.currentSuggestion = null; 
      
      // Opzionale: resetta i dadi visivamente (per pulizia UI)
      G.diceRoll = [0, 0];

      // B. Controllo giocatori eliminati 
      const currentPlayer = G.players[ctx.currentPlayer];
      
      // Il sistema continua a ciclare i turni saltando automaticamente i giocatori eliminati
      if (currentPlayer.isEliminated) {
        events.endTurn(); 
      }
    },

    // FINE TURNO (reset dei permessi speciali)
    onEnd: ({ G, ctx }) => {
      const player = G.players[ctx.currentPlayer];

      // Scadenza del "bonus passaggio"
      // Se questo giocatore aveva il permesso di non muoversi perché era stato 
      // "trascinato" qui da un altro durante un'ipotesi,
      // ora che ha finito il turno quel permesso scade.
      // Al prossimo turno, se è ancora qui, dovrà muoversi normalmente.
      if (player) {
        player.wasMovedBySuggestion = false;
      }
    }
  },
  
  // // Condizioni di vittoria/fine
  // endIf: (G, ctx) => {
  //   // Logica vittoria (da implementare dopo)
  // }
};