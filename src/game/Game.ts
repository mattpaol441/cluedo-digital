// File di logica pura di gioco: non usa componenti React, non gestisce UI e non contiene codice di presentazione.
// Serve solo a definire le regole, lo stato e le azioni del gioco Cluedo per Boardgame.io.
// Qui tutto è pensato per essere agnostico rispetto al frontend: riceve input, aggiorna lo stato, restituisce dati, senza mai “mostrare” nulla.
import type { Game } from 'boardgame.io';
import {
  type CluedoGameState,
  type Player,
  type Card,
  type SuspectID,
  // type RoomID, 
  // type WeaponID,
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

import { getValidMoves } from '../utils/movementLogic.ts';
import { findNextRefuter } from '../utils/logic.ts';

// Funzione per distribuire le carte
const dealCards = (random: any, numPlayers: number): { secretEnvelope: Card[], playerHands: Card[][], tableCards: Card[] } => {
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





// DEFINIZIONE DEL GIOCO 

export const CluedoGame: Game<CluedoGameState> = {
  name: 'cluedo-digital',

  // Configurazione Iniziale della partita con creazione dello stato globale della partita G (tiene traccia di tutto: carte, giocatori, posizioni, stato dei giocatori, fasi di gioco ecc....)
  setup: ({ ctx, random }, setupData): CluedoGameState => {
    const numPlayers = ctx.numPlayers;

    // Distribuzione carte
    const dealt = dealCards(random, numPlayers);

    // Creazione giocatori
    const players: Record<string, Player> = {};

    // Recuperiamo la lista giocatori passata da usePreLobby
    // Se è undefined, usiamo un array vuoto
    const realPlayers = setupData?.players || [];

    // Assegniamo i personaggi in ordine basato su SUSPECTS: Player 0 = Miss Scarlet, Player 1 = Peacock ecc....
    for (let i = 0; i < numPlayers; i++) {
      const suspectDef = SUSPECTS[i];
      const pID = i.toString();

      // LOGICA DI ASSOCIAZIONE
      // Se esiste un giocatore reale all'indice 'i', usiamo i suoi dati.
      // Altrimenti fallback su "Giocatore N"
      const realData = realPlayers[i];

      const displayName = realData ? realData.name : `Giocatore ${i + 1}`;

      players[pID] = {
        id: pID,
        name: displayName,
        // SALVIAMO L'ASSOCIAZIONE QUI in maniera permanente
        firebaseUID: realData ? realData.uid : undefined, // Per salvare l'UID Firebase nello stato del gioco
        character: suspectDef.id as SuspectID,
        color: CHARACTER_COLORS[suspectDef.id as SuspectID],

        // Assegniamo la mano calcolata prima
        hand: dealt.playerHands[i],

        // Posizione iniziale dalla mappa
        position: SUSPECT_START_COORDS[suspectDef.id as SuspectID],

        isEliminated: false,
        wasMovedBySuggestion: false, // All'inizio nessuno è stato trascinato
        currentRoom: undefined,
        enteredManually: false,       // Per sapere se deve fare ipotesi
        hasMoved: false,
        validMoves: [],
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

    // C. Ritorna lo stato iniziale completo (G)
    return {
      secretEnvelope: dealt.secretEnvelope,
      tableCards: dealt.tableCards,
      players: players,
      diceRoll: [0, 0],
      currentSuggestion: null,
      lastRefutation: null,
      // TIMEOUT SYSTEM
      turnStartedAt: undefined,
      stageStartedAt: undefined
    };
  },









  moves: {},  // Le mosse sono definite negli stages







  turn: {
    // Definiamo chi può giocare all'inizio del turno
    // - currentPlayer: nello stage 'action' per giocare normalmente
    // - others: nello stage 'passive' per poter fare solo surrender
    activePlayers: {
      currentPlayer: 'action',
      others: 'passive'  // Gli altri possono solo arrendersi
    },

    // INIZIO TURNO (setup e controlli come resettare flag e dati temporanei all'inizio del turno, saltare il turno se il giocatore è eliminato ecc....)
    onBegin: ({ G, ctx, events }) => {
      // 1. Pulizia Dati Generali
      G.lastRefutation = null;
      G.currentSuggestion = null;
      G.diceRoll = [0, 0];

      // TIMEOUT SYSTEM: Segna l'inizio del turno
      G.turnStartedAt = Date.now();
      G.stageStartedAt = undefined; // Reset stage timer

      const currentPlayer = G.players[ctx.currentPlayer];

      if (currentPlayer) {
        // 2. Reset logica movimento
        currentPlayer.hasMoved = false;
        currentPlayer.validMoves = [];

        // 3. Reset flag ingresso manuale (per obbligo ipotesi)
        currentPlayer.enteredManually = false;

        // NOTA: 'wasMovedBySuggestion' NON si resetta qui, 
        // serve al Frontend per il modale iniziale.
      }

      // 4. Salta turno se eliminato
      if (currentPlayer?.isEliminated) {
        events.endTurn();
      }
    },

    // FINE TURNO (Pulizia finale a fine turno, come resettare flag temporanei)
    onEnd: ({ G, ctx }) => {
      const player = G.players[ctx.currentPlayer];

      // Il bonus "Passive Move" scade alla fine del turno.
      if (player) {
        player.wasMovedBySuggestion = false;
      }
    },

    // CONFIGURAZIONE FASI (Stages) con dentro le MOSSE (moves), ovvero le azioni che i giocatori possono compiere nel loro turno, raggruppate in fasi 
    stages: {

      // FASE 1: ACTION, AZIONE NORMALE (Default)
      // Qui il giocatore tira i dadi, si muove, formula un'ipotesi, accusa.
      action: {
        moves: {
          // NOTA IMPORTANTE: per le azioni che vengono proibite a giocatori eliminati, il controllo va fatto qui dentro, non nel frontend. Il frontend è solo interfaccia utente, il vero "cervello" del gioco è qui.
          // In particolare, viene proibita ogni mossa, ad eccezione di revealCard (per mostrare le carte agli altri giocatori e quindi smentire le iptesi altrui)


          // ABBANDONA PARTITA (Surrender): disponibile anche per il currentPlayer

          surrender: ({ G, ctx, events, playerID }) => {
            const player = G.players[playerID!];
            if (player.isEliminated) return 'INVALID_MOVE';

            console.log(`[SERVER] ${player.name} si è arreso e abbandona la partita.`);
            player.isEliminated = true;

            const activePlayersCount = Object.values(G.players).filter(p => !p.isEliminated).length;

            if (activePlayersCount === 0) {
              console.log("[SERVER] GAME OVER: Tutti i giocatori si sono arresi.");
              // Estraggo la soluzione nel formato corretto
              const envelope = G.secretEnvelope;
              const solution = {
                suspectId: envelope.find(c => c.type === 'SUSPECT')?.id || 'Error',
                weaponId: envelope.find(c => c.type === 'WEAPON')?.id || 'Error',
                roomId: envelope.find(c => c.type === 'ROOM')?.id || 'Error'
              };
              events.endGame({ winner: null, solution });
            } else if (ctx.currentPlayer === playerID) {
              events.endTurn();
            }
          },

          // TIMEOUT SYSTEM: Elimina il giocatore di turno (chiamabile da qualsiasi client)
          // Questa mossa permette a qualsiasi client connesso di eliminare il currentPlayer
          // quando scade il timeout del turno. BoardGame.io gestisce le race condition.
          timeoutCurrentPlayer: ({ G, ctx, events }) => {
            const currentPlayerID = ctx.currentPlayer;
            const player = G.players[currentPlayerID];

            // Se già eliminato, non fare nulla
            if (player.isEliminated) return;

            console.log(`[SERVER] TIMEOUT TURNO - ${player.name} eliminato per inattività`);
            player.isEliminated = true;

            const activePlayersCount = Object.values(G.players).filter(p => !p.isEliminated).length;

            if (activePlayersCount === 0) {
              console.log("[SERVER] GAME OVER: Tutti i giocatori eliminati.");
              // Estraggo la soluzione nel formato corretto
              const envelope = G.secretEnvelope;
              const solution = {
                suspectId: envelope.find(c => c.type === 'SUSPECT')?.id || 'Error',
                weaponId: envelope.find(c => c.type === 'WEAPON')?.id || 'Error',
                roomId: envelope.find(c => c.type === 'ROOM')?.id || 'Error'
              };
              events.endGame({ winner: null, solution });
            } else {
              events.endTurn();
            }
          },

          rollDice: ({ G, ctx, random }) => {
            const die1 = random.Die(6);
            const die2 = random.Die(6);
            G.diceRoll = [die1, die2]; // Salviamo i dadi nello stato globale del gioco 

            const player = G.players[ctx.currentPlayer]; // Recuperiamo il giocatore corrente
            // Appena decido di tirare i dadi, significa che sto iniziando un nuovo movimento.
            // Quindi cancello qualsiasi "memoria" del fatto che ero entrato in stanza nel turno precedente (resetta lo stato di ingresso manuale).
            if (player) { // Se il player esiste (sicurezza)
              player.enteredManually = false;
              player.hasMoved = false;
            }
            // Calcoliamo le mosse valide che il giocatore può fare in base alla posizione attuale, al totale dei dadi, agli altri giocatori e al suo ID.
            player.validMoves = getValidMoves(player.position.x, player.position.y, die1 + die2, G.players, player.id);
            console.log(`Dadi lanciati: ${die1} e ${die2} (Totale: ${die1 + die2}). Mosse calcolate:`, player.validMoves);
          },


          movePawn: ({ G, ctx, events }, x: number, y: number) => {

            const playerID = ctx.currentPlayer;
            const player = G.players[playerID]; // Recupero del giocatore corrente
            const coordKey = `${x},${y}`; // Creo una stringa chiave con le coordinate di destinazione
            // Se il Player è eliminato, ha già mosso o non ha ancora tirato i dadi, blocchiamo il movimento 
            if (player.isEliminated) return 'INVALID_MOVE';
            if (player.hasMoved) { console.log("Errore: Il giocatore ha già effettuato un movimento in questo turno."); return 'INVALID_MOVE'; }
            if (G.diceRoll[0] === 0 && G.diceRoll[1] === 0) { console.log("Errore: I dadi non sono stati lanciati."); return 'INVALID_MOVE'; }

            // // 2. BLOCCO MOVIMENTI MULTIPLI (Stop Obbligatorio)
            // // Se hai già mosso 1 volta in questo turno, non puoi muovere ancora! Ciò non vuol dire che non puoi fare altre azioni, ma solo che il movimento è limitato a 1 per turno.
            // if ((ctx.numMoves ?? 0) > 0) {
            //   return 'INVALID_MOVE';
            // }


            // FIX BUG CLICK STESSA CASELLA
            // BLOCCO MOSSA NULLA:
            // Se le coordinate di destinazione (x, y) sono identiche a quelle attuali,
            // annulliamo l'azione. In questo modo boardgame.io NON incrementa numMoves.
            if (player.position.x === x && player.position.y === y) {
              console.warn("Mossa ignorata: Clic sulla stessa casella.");
              return 'INVALID_MOVE';
            }
            // Se la destinazione non è tra le mosse valide calcolate, blocchiamo il movimento 
            if (!player.validMoves.includes(coordKey)) {
              console.log(`Errore: Mossa non valida verso (${x}, ${y}). Mosse valide sono:`, player.validMoves);
              return 'INVALID_MOVE';
            }

            // NUOVO FIX: BLOCCO STESSA STANZA
            // Verifichiamo se la casella di destinazione è una porta che conduce 
            // alla STESSA stanza in cui il giocatore si trova già.
            const targetRoom = DOOR_MAPPING[coordKey];
            const currentRoom = player.currentRoom;

            if (targetRoom && currentRoom && targetRoom === currentRoom) {// Se la casella di destinazione é una porta e il giocatore é in una stanza e si trova nella stanza uguale alla destinazione in cui vuole entrare
              console.warn("Mossa illegale: Tentativo di rientrare nella stessa stanza.");
              return 'INVALID_MOVE';
            }






            // I muri sono proibiti, non ci si può muovere lì, quindi li blocchiamo subito
            // Tutto il resto, ovvero HALL, DOOR, START, CENTER va bene
            // if  (cellType === CELL_TYPES.VOID) {
            //   return 'INVALID_MOVE'; 
            // }

            // // Definiamo le zone dove si può stare in tanti, quindi dove è consentita la sovrapposizione (Safe Zones)
            // // Consentita se è una di queste celle:
            // const canStack = (
            //   cellType === CELL_TYPES.CENTER || // Al centro è fondamentale, perchè se un player fa l'accusa finale e sbaglia allora viene eliminato ma rimane al centro, quindi se non fosse consentita la sovrapposizione gli altri non potrebbero più andarci e fare l'accusa finale
            //   cellType === CELL_TYPES.DOOR      // Sulle porte si deve poter stare in tanti, per facilitare l'ingresso/uscita dalle stanze
            // );

            // if (!canStack) { // // Controllo se c'è qualcuno (ignorando me stesso)
            // // Nota: È importante decidere se i giocatori eliminati bloccano il passaggio.
            // // Di solito in Cluedo digitale, se uno è eliminato la sua pedina sparisce o diventa trasparente.
            // // Qui controlliamo solo se c'è una collisione fisica sui dati.
            //   const isOccupied = Object.values(G.players).some((p: any) => 
            //     p.id !== ctx.currentPlayer && 
            //     p.position.x === x &&         
            //     p.position.y === y
            //     // !p.isEliminated // OPZIONALE: Se vuoi che i morti non blocchino i corridoi, scommenta questa riga            
            //   );
            //   if (isOccupied) return 'INVALID_MOVE'; 
            // }

            // Aggiorna la posizione del giocatore, segna che ha mosso e resetta le mosse valide
            player.position = { x, y };
            player.hasMoved = true;
            player.validMoves = [];

            // Resettiamo sempre il flag "trascinato" quando ci si muove volontariamente
            player.wasMovedBySuggestion = false;

            const cellType = BOARD_LAYOUT[y][x]; // Determiniamo il tipo di cella in cui il giocatore si è mosso

            // 4. GESTIONE SPECIFICA DEL CENTRO (ACCUSA FINALE)
            if (cellType === CELL_TYPES.CENTER) { // Se entra nella stanza centrale
              console.log("Il giocatore è entrato nella Busta Gialla (Centro)!");

              // Assegniamo una 'stanza fittizia' (aggiorna lo stato) per attivare la UI dell'accusa
              player.currentRoom = 'CENTER_ROOM';

              // Il giocatore deve ora avere il tempo di selezionare le carte e fare l'accusa.
              return; // termina la funzione qui
            }

            // const coordKey = `${x},${y}`;
            if (DOOR_MAPPING[coordKey]) { // Se la casella di destinazione è una porta
              player.currentRoom = DOOR_MAPPING[coordKey]; // Aggiorna la stanza corrente del giocatore
              // Flag IMPORTANTE: Sono entrato con le mie gambe, quindi DEVO fare un'ipotesi
              player.enteredManually = true;
              console.log(`Player ${player.name} è entrato nella stanza: ${player.currentRoom}`); // Qui non deve chiudere il turno, perché dopo essersi mosso in una stanza il giocatore deve poter formulare un'ipotesi 
            }

            else { // Se la casella di destinazione non è una porta
              player.currentRoom = undefined; // In corridoio
              player.enteredManually = false; // Corridoio, quindi niente ipotesi
              console.log('Movimento in corridoio completato.');

              // In corridoio non c'è altro da fare, passo il turno
              events.endTurn();
            }
          },






          makeHypothesis: ({ G, ctx, events }, suspectId: string, weaponId: string) => {
            const playerID = ctx.currentPlayer;
            const player = G.players[playerID]; // Recupero del giocatore corrente

            // I giocatori eliminati non possono fare ipotesi 
            if (player.isEliminated) {
              return 'INVALID_MOVE';
            }

            const currentRoom = player.currentRoom;

            // Deve essere fisicamente in una stanza vera (non corridoio o centro)
            if (!currentRoom || currentRoom === 'CENTER_ROOM') {
              return 'INVALID_MOVE';
            }

            // CONTROLLO LEGITTIMITÀ DELL'IPOTESI
            // Regola: Puoi fare ipotesi SOLO se ti sei mosso in questo turno OPPURE 
            // se sei stato trascinato qui da un avversario ("wasMovedBySuggestion").
            // Se eri già qui dall'inizio del turno e nessuno ti ha toccato, devi uscire muovendoti.

            const hasMovedThisTurn = player.hasMoved || (ctx.numMoves ?? 0) > 0 || player.enteredManually; // Aggiunto enteredManually per sicurezza, anche se teoricamente hasMoved dovrebbe coprire quel caso, infatti potremmo togliere anche ctx.numMoves, lasciato per sicurezza. 
            const wasDraggedHere = player.wasMovedBySuggestion;

            if (!hasMovedThisTurn && !wasDraggedHere) {
              console.warn("Mossa illegale, devi muoverti prima di fare un'ipotesi se eri già nella stanza.");
              return 'INVALID_MOVE';
            }


            console.log(`IPOTESI REGISTRATA: ${player.name} accusa ${suspectId} in ${currentRoom}`);

            // TELETRASPORTO DEL SOSPETTATO: come prima cosa cerca tra tutti i giocatori chi ha il personaggio sospettato nell'ipotesi (per character o per nome)   
            const accusedPlayerKey = Object.keys(G.players).find( // Si ottiene un array di tutte le chiavi (ID) dei giocatori presenti in G.players, e .find scorre queste chiavi per trovare quella che soddisfa la condizione specificata nella funzione
              key => G.players[key].character === suspectId || G.players[key].name === suspectId // Per ogni giocatore (key), controlla se il suo personaggio (character) o il suo nome corrisponde all'ID del sospettato nell'ipotesi
            );

            if (accusedPlayerKey) { // Se abbiamo trovato un giocatore che corrisponde al sospettato
              const accusedPlayer = G.players[accusedPlayerKey];
              if (accusedPlayer.id !== playerID) { // E non è lo stesso che sta facendo l'ipotesi
                // VERIFICA: Il sospettato è già qui?
                const isAlreadyHere = accusedPlayer.currentRoom === currentRoom; // Confronta la stanza in cui si trova attualmente il giocatore sospettato (accusedPlayer.currentRoom) con la stanza in cui si trova il giocatore che sta facendo l’ipotesi (currentRoom).
                // Il risultato (booleano) viene salvato in isAlreadyHere

                // Spostiamo il sospettato
                accusedPlayer.currentRoom = currentRoom;
                accusedPlayer.position = { ...player.position };

                // REGOLA CRITICA:
                // Il flag "wasMovedBySuggestion" (che dà diritto a non muoversi al prossimo turno)
                // si attiva SOLO se il giocatore è stato effettivamente trascinato da altrove.
                // Se era già nella stanza, non riceve nessun bonus.
                if (!isAlreadyHere) {
                  accusedPlayer.wasMovedBySuggestion = true;
                  console.log(`TELETRASPORTO: ${accusedPlayer.name} trascinato in ${currentRoom}`);
                } else {
                  console.log(`! ${accusedPlayer.name} era già nella stanza. Nessun bonus movimento.`);
                }
              }
            }


            // FINE FASE ATTIVA
            // Il turno non finisce, ma entra nella fase "Smentita".

            // CERCA SMENTITORE (Auto-Skip) 
            // Invece di assegnare semplicemente il prossimo giocatore, usiamo la funzione findNextRefuter definita in utils/logic.ts

            // Resettiamo eventuali risultati vecchi di smentite precedenti per pulire l'interfaccia
            G.lastRefutation = null;

            const result = findNextRefuter( // Restituisce i dati del giocatore che può smentire, o null se nessuno può farlo
              G,
              ctx,
              Number(playerID),
              { s: suspectId, w: weaponId, r: currentRoom }
            );

            if (result) {
              // SE ABBIAMO TROVATO QUALCUNO CHE PUÒ SMENTIRE
              console.log(`[SERVER] Smentita richiesta a PlayerID: ${result.playerID}`);
              // Salviamo lo stato della suggestione in corso per la fase di smentita (refutationStage)
              G.currentSuggestion = {
                suggesterId: playerID,
                suspect: suspectId as any,
                weapon: weaponId as any,
                room: currentRoom as any,

                currentResponder: result.playerID,
                matchingCards: result.matchingCards // SALVIAMO LE CARTE CHE PUÒ MOSTRARE
              };

              // TIMEOUT SYSTEM: Segna l'inizio della fase refutation
              G.stageStartedAt = Date.now();

              // ATTIVIAMO LO STAGE: Il gioco si congela e tocca solo a result.playerID
              // Gli altri rimangono in 'passive' per poter fare surrender
              events.setActivePlayers({
                value: {
                  [result.playerID]: 'refutationStage'
                },
                others: 'passive'
              });

            } else {
              // SE INVECE NESSUNO HA LE CARTE (Auto-Skip totale)
              console.log("[SERVER] Nessuno può smentire l'ipotesi.");

              // Salviamo il risultato vuoto così il frontend può dire "Nessuna smentita!"
              G.lastRefutation = {
                suggesterId: playerID,
                refuterId: null,
                cardShown: null
              };

              G.currentSuggestion = null;

              // Qui il turno finisce (o lasciamo che l'utente clicchi "Fine Turno" dopo aver visto il messaggio)
              // Per ora chiudiamo il turno per mantenere il flusso veloce

              //events.endTurn(); // TEMPORANEO PER TEST
            }
          },









          makeAccusation: ({ G, ctx, events }, suspectId: string, weaponId: string, roomId: string) => { // La funzione riceve i 3 ID che arrivano dal modale (suspectId, weaponId, roomId)
            const playerID = ctx.currentPlayer;
            const player = G.players[playerID];
            // Se il Player è eliminato, blocchiamo nuove accuse 
            if (player.isEliminated) return 'INVALID_MOVE';

            // Se non è nella stanza centrale (Busta Gialla), non può accusare
            // Questo previene bug o chiamate illegali dal frontend
            if (player.currentRoom !== 'CENTER_ROOM') {
              console.warn(`[CHEAT] ${player.name} ha provato ad accusare da ${player.currentRoom}`);
              return 'INVALID_MOVE';
            }

            console.log(`[SERVER] Accusa ricevuta da ${player.name}:`, { suspectId, weaponId, roomId });

            // Recuperiamo la Soluzione dalla Busta Gialla
            // G.secretEnvelope è un array di 3 oggetti Card (inizializzato sopra, nel setup)
            const envelope = G.secretEnvelope;

            // 2. Verifichiamo se le carte corrispondono
            // Controlliamo se l'ID ricevuto esiste tra le carte della busta
            const isSuspectCorrect = envelope.some(card => card.id === suspectId);
            const isWeaponCorrect = envelope.some(card => card.id === weaponId);
            const isRoomCorrect = envelope.some(card => card.id === roomId);

            // PREPARIAMO LA SOLUZIONE VERA (PER ENDGAME)
            // Indipendentemente da cosa ha detto il giocatore, la verità è nella busta!
            // Usiamo .find per pescare la carta giusta per tipo.
            const realSuspect = envelope.find(c => c.type === 'SUSPECT')?.id || 'Error';
            const realWeapon = envelope.find(c => c.type === 'WEAPON')?.id || 'Error';
            const realRoom = envelope.find(c => c.type === 'ROOM')?.id || 'Error';

            const realSolution = {
              suspectId: realSuspect, // string | Error
              weaponId: realWeapon, // string | Error
              roomId: realRoom  // string | Error
            };

            // 3. Logica di Vittoria o Sconfitta
            if (isSuspectCorrect && isWeaponCorrect && isRoomCorrect) {
              // VITTORIA
              console.log(`[SERVER] VITTORIA! ${player.name} ha risolto il caso.`);

              // Termina immediatamente la partita dichiarando il vincitore.
              // Passiamo anche la soluzione per poterla mostrare a tutti nella schermata di Game Over.
              events.endGame({
                winner: playerID,
                solution: realSolution // Passiamo la soluzione vera (che coincide con l'accusa, ma per sicurezza usiamo quella della busta) a GameOverModal
              });

            } else {
              // SCONFITTA (ELIMINAZIONE)
              console.log(`[SERVER] Accusa ERRATA. ${player.name} è eliminato.`);

              // A. Marchiamo il giocatore come eliminato
              // Questo è fondamentale: impedisce al frontend di mostrare ancora il modale
              // e impedirà al giocatore di muoversi nei turni futuri (se gestisci il check su movePawn).
              player.isEliminated = true;

              /// B. CONTROLLO "GAME OVER TOTALE"
              // Contiamo quanti giocatori sono ancora in gioco (non eliminati)
              const activePlayersCount = Object.values(G.players).filter(p => !p.isEliminated).length;

              if (activePlayersCount === 0) {
                console.log("GAME OVER: Tutti i detective hanno fallito.");
                // Nessuno ha vinto. La partita finisce.
                events.endGame({
                  winner: null, // Null indica che ha vinto il crimine
                  solution: realSolution // Qui passiamo la soluzione VERA, non quella sbagliata del giocatore
                });
              } else {
                // C. Se c'è ancora qualcuno vivo, il gioco continua
                events.endTurn();
              }
            }
          },

          // TIMEOUT SYSTEM: Smentita automatica (chiamabile da action, per il currentPlayer/suggester)
          // Permette al suggester di forzare la smentita quando scade il timeout
          skipRefutation: ({ G, events }) => {
            const suggestion = G.currentSuggestion;

            // Sicurezza: Se non c'è nessuna ipotesi attiva, esci
            if (!suggestion) return;

            const currentResponderID = suggestion.currentResponder;
            const matchingCards = suggestion.matchingCards;

            console.log(`[SERVER] Timeout smentita (action) - Player ${currentResponderID}`);

            // Se il player ha carte che matchano, ne mostriamo una a caso
            if (matchingCards.length > 0) {
              const randomIndex = Math.floor(Math.random() * matchingCards.length);
              const randomCardId = matchingCards[randomIndex];

              console.log(`[SERVER] Auto-mostra carta: ${randomCardId}`);

              const player = G.players[currentResponderID!];
              const cardObj = player.hand.find(c => c.id === randomCardId);

              G.lastRefutation = {
                suggesterId: suggestion.suggesterId,
                refuterId: currentResponderID!,
                cardShown: cardObj || null
              };

              G.currentSuggestion = null;
              G.stageStartedAt = undefined;

              events.setActivePlayers({
                currentPlayer: 'action',
                others: 'passive'
              });
            } else {
              console.warn('[SERVER] skipRefutation (action) - nessuna carta disponibile');

              G.lastRefutation = {
                suggesterId: suggestion.suggesterId,
                refuterId: null,
                cardShown: null
              };
              G.currentSuggestion = null;
              G.stageStartedAt = undefined;

              events.setActivePlayers({
                currentPlayer: 'action',
                others: 'passive'
              });
            }
          },

          passTurn: ({ events, G, ctx }) => {
            const player = G.players[ctx.currentPlayer];
  
            // 1. Reset flag del giocatore
            player.enteredManually = false; 
            player.hasMoved = false; 
            player.validMoves = []; // Importante svuotare le mosse vecchie

            // 2. Reset Variabili Globali
            G.lastRefutation = null;
            G.currentSuggestion = null;
            G.diceRoll = [0, 0]; // Sicurezza extra

            console.log(`[SERVER] ${player.name} passa il turno.`);
            
            // 3. Reset Stage e ActivePlayers (FONDAMENTALE)
            // Assicuriamoci che il prossimo giocatore inizi pulito in 'action'
            events.setActivePlayers({ currentPlayer: 'action', others: 'passive' });
            
            // 4. Fine Turno
            events.endTurn();

        }

        }
      },

      // FASE 2: SMENTITA (Refutation)
      // Si attiva dopo una makeHypothesis.
      // Qui tocca a UN ALTRO giocatore (quello a sinistra) rispondere.
      refutationStage: {
        moves: {
          // NOTA: Usiamo playerID (chi sta agendo) e NON ctx.currentPlayer (che è il giocatore del turno, cioè il suggester)
          refuteSuggestion: ({ G,
            // ctx, 
            events,
            playerID }, cardIdToReveal: string) => {
            const suggestion = G.currentSuggestion;

            // Sicurezza: Se non c'è nessuna ipotesi attiva, esci
            if (!suggestion) return;

            // Sicurezza: Il giocatore possiede davvero quella carta tra quelle richieste?
            if (!suggestion.matchingCards.includes(cardIdToReveal)) {
              console.warn(`[CHEAT] Tentativo di mostrare carta non valida: ${cardIdToReveal}`);
              return 'INVALID_MOVE';
            }

            console.log(`[SERVER] Player ${playerID} mostra la carta ${cardIdToReveal}`);

            // Recuperiamo l'oggetto carta completo dalla mano del giocatore che sta smentendo
            const player = G.players[playerID!];
            const cardObj = player.hand.find(c => c.id === cardIdToReveal);

            // 1. Salviamo il risultato per mostrarlo al Frontend
            G.lastRefutation = {
              suggesterId: suggestion.suggesterId,
              refuterId: playerID!,
              cardShown: cardObj || null // Passiamo l'oggetto carta
            };

            // 2. Puliamo lo stato di attesa
            G.currentSuggestion = null;
            G.stageStartedAt = undefined; // Reset timer stage

            // 3. FINE DEL TURNO
            // Poiché siamo nel turno del "Suggester" (ma sta agendo il "Refuter"),
            // chiamare endTurn() chiude il turno del Suggester e passa la mano al prossimo.
            // events.endTurn(); 

            // Ripristiniamo gli stage normali: currentPlayer torna in 'action', gli altri in 'passive'
            events.setActivePlayers({
              currentPlayer: 'action',
              others: 'passive'
            });
          },

          // TIMEOUT SYSTEM: Mossa per gestire timeout smentita (chiamata automaticamente dal timer)
          // REGOLA CLUEDO: Se hai carte per smentire, DEVI mostrarne una.
          // Quindi invece di "saltare", il sistema sceglie automaticamente una carta random.
          skipRefutation: ({ G, events }) => {
            const suggestion = G.currentSuggestion;

            // Sicurezza: Se non c'è nessuna ipotesi attiva, esci
            if (!suggestion) return;

            const currentResponderID = suggestion.currentResponder;
            const matchingCards = suggestion.matchingCards;

            console.log(`[SERVER] Timeout smentita - Player ${currentResponderID}`);

            // Se il player ha carte che matchano, ne mostriamo una a caso
            if (matchingCards.length > 0) {
              // Selezione random di una carta tra quelle disponibili
              const randomIndex = Math.floor(Math.random() * matchingCards.length);
              const randomCardId = matchingCards[randomIndex];

              console.log(`[SERVER] Auto-mostra carta: ${randomCardId} (scelta random tra ${matchingCards.length} opzioni)`);

              // Recuperiamo l'oggetto carta completo dalla mano del giocatore
              const player = G.players[currentResponderID!];
              const cardObj = player.hand.find(c => c.id === randomCardId);

              // Salviamo il risultato (stessa logica di refuteSuggestion)
              G.lastRefutation = {
                suggesterId: suggestion.suggesterId,
                refuterId: currentResponderID!,
                cardShown: cardObj || null
              };

              // Puliamo lo stato
              G.currentSuggestion = null;
              G.stageStartedAt = undefined;

              // Ripristiniamo gli stage normali
              events.setActivePlayers({
                currentPlayer: 'action',
                others: 'passive'
              });

            } else {
              // Caso edge: il player non ha carte (non dovrebbe mai accadere se la logica è corretta)
              // Ma per sicurezza, resettiamo comunque lo stato
              console.warn('[SERVER] skipRefutation chiamato ma nessuna carta disponibile - reset stato');

              G.lastRefutation = {
                suggesterId: suggestion.suggesterId,
                refuterId: null,
                cardShown: null
              };
              G.currentSuggestion = null;
              G.stageStartedAt = undefined;

              events.setActivePlayers({
                currentPlayer: 'action',
                others: 'passive'
              });
            }
          }
        }
      },

      // FASE PASSIVA: per i giocatori che NON hanno il turno
      // Possono arrendersi e chiamare il timeout del giocatore corrente
      passive: {
        moves: {

          // ABBANDONA PARTITA (Surrender): disponibile per chi non ha il turno
          surrender: ({ G, events, playerID }) => {
            const player = G.players[playerID!];
            if (player.isEliminated) return 'INVALID_MOVE';

            console.log(`[SERVER] ${player.name} si è arreso e abbandona la partita.`);
            player.isEliminated = true;

            const activePlayersCount = Object.values(G.players).filter(p => !p.isEliminated).length;

            if (activePlayersCount === 0) {
              console.log("[SERVER] GAME OVER: Tutti i giocatori si sono arresi.");
              // Estraggo la soluzione nel formato corretto
              const envelope = G.secretEnvelope;
              const solution = {
                suspectId: envelope.find(c => c.type === 'SUSPECT')?.id || 'Error',
                weaponId: envelope.find(c => c.type === 'WEAPON')?.id || 'Error',
                roomId: envelope.find(c => c.type === 'ROOM')?.id || 'Error'
              };
              events.endGame({ winner: null, solution });
            }
            // Non chiamo endTurn() perché non è il turno di questo giocatore
          },

          // TIMEOUT SYSTEM: Elimina il giocatore di turno (chiamabile da passive)
          // Permette agli altri client di eliminare il currentPlayer quando scade il timeout
          timeoutCurrentPlayer: ({ G, ctx, events }) => {
            const currentPlayerID = ctx.currentPlayer;
            const player = G.players[currentPlayerID];

            // Se già eliminato, non fare nulla
            if (player.isEliminated) return;

            console.log(`[SERVER] TIMEOUT TURNO (passive) - ${player.name} eliminato per inattività`);
            player.isEliminated = true;

            const activePlayersCount = Object.values(G.players).filter(p => !p.isEliminated).length;

            if (activePlayersCount === 0) {
              console.log("[SERVER] GAME OVER: Tutti i giocatori eliminati.");
              // Estraggo la soluzione nel formato corretto
              const envelope = G.secretEnvelope;
              const solution = {
                suspectId: envelope.find(c => c.type === 'SUSPECT')?.id || 'Error',
                weaponId: envelope.find(c => c.type === 'WEAPON')?.id || 'Error',
                roomId: envelope.find(c => c.type === 'ROOM')?.id || 'Error'
              };
              events.endGame({ winner: null, solution });
            } else {
              events.endTurn();
            }
          },

          // TIMEOUT SYSTEM: Smentita automatica (chiamabile da passive)
          // Permette a qualsiasi client di forzare la smentita quando scade il timeout
          skipRefutation: ({ G, events }) => {
            const suggestion = G.currentSuggestion;

            // Sicurezza: Se non c'è nessuna ipotesi attiva, esci
            if (!suggestion) return;

            const currentResponderID = suggestion.currentResponder;
            const matchingCards = suggestion.matchingCards;

            console.log(`[SERVER] Timeout smentita (passive) - Player ${currentResponderID}`);

            // Se il player ha carte che matchano, ne mostriamo una a caso
            if (matchingCards.length > 0) {
              const randomIndex = Math.floor(Math.random() * matchingCards.length);
              const randomCardId = matchingCards[randomIndex];

              console.log(`[SERVER] Auto-mostra carta: ${randomCardId}`);

              const player = G.players[currentResponderID!];
              const cardObj = player.hand.find(c => c.id === randomCardId);

              G.lastRefutation = {
                suggesterId: suggestion.suggesterId,
                refuterId: currentResponderID!,
                cardShown: cardObj || null
              };

              G.currentSuggestion = null;
              G.stageStartedAt = undefined;

              events.setActivePlayers({
                currentPlayer: 'action',
                others: 'passive'
              });
            } else {
              console.warn('[SERVER] skipRefutation (passive) - nessuna carta disponibile');

              G.lastRefutation = {
                suggesterId: suggestion.suggesterId,
                refuterId: null,
                cardShown: null
              };
              G.currentSuggestion = null;
              G.stageStartedAt = undefined;

              events.setActivePlayers({
                currentPlayer: 'action',
                others: 'passive'
              });
            }
          }
        }
      }
    }
  },

  ai: {
    enumerate: (G, ctx, playerID) => {
      const moves: { move: string; args?: any[] }[] = [];
      const pID = String(playerID);
      const player = G.players[pID];

      if (!player || player.isEliminated) return [];

      // 1. SMENTITA (Priorità)
      const suggestion = G.currentSuggestion;
      if (suggestion && String(suggestion.currentResponder) === pID) {
        const matchingCards = suggestion.matchingCards;
        if (matchingCards.length > 0) {
          // Restituisci TUTTE le opzioni valide, il Bot sceglierà
          matchingCards.forEach((cardId: string) => {
             moves.push({ move: 'refuteSuggestion', args: [cardId] });
          });
          return moves;
        }
        return []; 
      }

      if (String(ctx.currentPlayer) !== pID) return [];

      // Check fine fase smentita
      if (G.lastRefutation && String(G.lastRefutation.suggesterId) === pID) {
        return [{ move: 'passTurn' }];
      }

      // 2. ACCUSA (Endgame)
      // Se sono al centro, offro la possibilità di accusare
      if (player.currentRoom === 'CENTER_ROOM') {
          // Args dummy, il SmartBot li sovrascriverà con la soluzione vera
          moves.push({ move: 'makeAccusation', args: ['suspect', 'weapon', 'room'] });
      }

      // 3. IPOTESI
      const isInRoom = player.currentRoom && player.currentRoom !== 'CENTER_ROOM';
      const canMakeHypothesis = isInRoom && (player.enteredManually || player.wasMovedBySuggestion);

      if (canMakeHypothesis) {
        // Args dummy, SmartBot li sovrascriverà
        moves.push({ move: 'makeHypothesis', args: ['suspect', 'weapon'] });
        // Non ritorniamo subito, perché potremmo voler fare altro? No, ipotesi è bloccante.
        return moves;
      }

      // 4. DADI
      if (G.diceRoll[0] === 0 && G.diceRoll[1] === 0) {
        return [{ move: 'rollDice'}];
      }

      // 5. MOVIMENTO
      if ((G.diceRoll[0] > 0 || G.diceRoll[1] > 0) && !player.hasMoved) {
        if (player.validMoves && player.validMoves.length > 0) {
          
          // Aggiungi tutte le mosse. SmartBot sceglierà.
          // Possiamo dare un "suggerimento" mettendo prima quelle delle stanze
          player.validMoves.forEach((coordKey: string) => {
             const [x, y] = coordKey.split(',').map(Number);
             moves.push({ move: 'movePawn', args: [x, y] });
          });
          return moves;
        }
      } 
      
      // 6. FALLBACK
      return [{ move: 'passTurn' }];
    },
  },
};