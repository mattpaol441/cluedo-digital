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





// DEFINIZIONE DEL GIOCO 

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

    // C. Ritorna lo Stato Iniziale Completo (G)
    return {
      secretEnvelope: dealt.secretEnvelope,
      tableCards: dealt.tableCards,
      players: players,
      diceRoll: [0, 0], 
      currentSuggestion: null,
      lastRefutation: null
      };
  },









   moves: {},







  turn: {
    // Definiamo chi può giocare all'inizio del turno
    // 'currentPlayer' è il comportamento standard (tocca a chi ha i dadi)
    activePlayers: { currentPlayer: 'action' },

    // INIZIO TURNO (setup e controlli)
    onBegin: ({ G, ctx, events }) => {
      // 1. Pulizia Dati Generali
      G.lastRefutation = null;
      G.currentSuggestion = null; 
      G.diceRoll = [0, 0];

      const currentPlayer = G.players[ctx.currentPlayer];

      if (currentPlayer) {
        // 2. Reset Logica Movimento
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

    // FINE TURNO (Pulizia finale)
    onEnd: ({ G, ctx }) => {
      const player = G.players[ctx.currentPlayer];
      
      // Il bonus "Passive Move" scade alla fine del turno.
      if (player) {
        player.wasMovedBySuggestion = false;
      }
    },

    // CONFIGURAZIONE FASI (Stages)
    stages: {
      
      // FASE 1: AZIONE NORMALE (Default)
      // Qui il giocatore tira i dadi, si muove, accusa.
      action: {
        moves: { 
            // NOTA IMPORTANTE: per le azioni che vengono proibite a giocatori eliminati, il controllo va fatto qui dentro, non nel frontend. Il frontend è solo un'interfaccia utente, il vero "cervello" del gioco è qui.
            // In particolare, viene proibita ogni mossa, ad eccezione di revealCard (per mostrare le carte agli altri giocatori e quindi smentire le iptesi altrui)
            rollDice: ({ G, ctx , random }) => {
              const die1 = random.Die(6);
              const die2 = random.Die(6);
              G.diceRoll = [die1, die2];
              
              const player = G.players[ctx.currentPlayer];
              // Appena decido di tirare i dadi, significa che sto iniziando un nuovo movimento.
              // Quindi cancello qualsiasi "memoria" del fatto che ero entrato in stanza nel turno precedente.
              if (player) {
                  player.enteredManually = false; 
                  player.hasMoved = false; 
              }
              // Usiamo la funzione del collega per calcolare le mosse
              player.validMoves = getValidMoves(player.position.x, player.position.y, die1 + die2, G.players, player.id);
              console.log(`Dadi lanciati: ${die1} e ${die2} (Totale: ${die1 + die2}). Mosse calcolate:`, player.validMoves);
            },


            movePawn: ({ G , ctx, events }, x: number, y: number) => {

              const playerID = ctx.currentPlayer;
              const player = G.players[playerID];
              const coordKey = `${x},${y}`;
              // Se il Player è eliminato, blocchiamo il movimento 
              if (player.isEliminated) return 'INVALID_MOVE';
              if (player.hasMoved) {console.log("Errore: Il giocatore ha già effettuato un movimento in questo turno."); return 'INVALID_MOVE'; }
              if (G.diceRoll[0] === 0 && G.diceRoll[1] === 0) {console.log("Errore: I dadi non sono stati lanciati."); return 'INVALID_MOVE'; }

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

              if (!player.validMoves.includes(coordKey)) {
                console.log(`Errore: Mossa non valida verso (${x}, ${y}). Mosse valide sono:`, player.validMoves);
                return 'INVALID_MOVE';
              }

              // NUOVO FIX: BLOCCO STESSA STANZA
              // Verifichiamo se la casella di destinazione è una porta che porta 
              // alla STESSA stanza in cui il giocatore si trova già.
              const targetRoom = DOOR_MAPPING[coordKey];
              const currentRoom = player.currentRoom;

              if (targetRoom && currentRoom && targetRoom === currentRoom) {
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

              // Aggiorna la posizione del giocatore
              player.position = { x, y };
              player.hasMoved = true; 
              player.validMoves = [];

              // Resettiamo sempre il flag "trascinato" quando ci si muove volontariamente
              player.wasMovedBySuggestion = false; 

              const cellType = BOARD_LAYOUT[y][x];

              // 4. GESTIONE SPECIFICA DEL CENTRO (ACCUSA FINALE)
              if (cellType === CELL_TYPES.CENTER) {
                console.log("Il giocatore è entrato nella Busta Gialla (Centro)!");
                
                // Assegniamo una 'stanza fittizia' per attivare la UI dell'Accusa
                player.currentRoom = 'CENTER_ROOM'; 
                
                // Il giocatore deve ora avere il tempo di selezionare le carte e fare l'accusa.
                return; 
              }

              // const coordKey = `${x},${y}`;
              if (DOOR_MAPPING[coordKey]) {
                player.currentRoom = DOOR_MAPPING[coordKey];
                // Flag IMPORTANTE: Sono entrato con le mie gambe, quindi DEVO fare un'ipotesi
                player.enteredManually = true; 
                console.log(`Player ${player.name} è entrato nella stanza: ${player.currentRoom}`); // Qui non deve chiudere il turno, perché dopo essersi mosso in una stanza il giocatore deve poter formulare un'ipotesi 
              }

              else {
                player.currentRoom = undefined; // In corridoio
                player.enteredManually = false; // Corridoio -> niente ipotesi
                console.log('Movimento in corridoio completato.');
                
                // In corridoio non c'è altro da fare, passo il turno
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
                
                const hasMovedThisTurn = player.hasMoved || (ctx.numMoves ?? 0) > 0 || player.enteredManually; // Aggiunto enteredManually per sicurezza, anche se teoricamente hasMoved dovrebbe coprire quel caso, infatti potremmo togliere anche ctx.numMoves, lasciato per sicurezza. 
                const wasDraggedHere = player.wasMovedBySuggestion;

                if (!hasMovedThisTurn && !wasDraggedHere) {
                    console.warn("Mossa illegale, devi muoverti prima di fare un'ipotesi se eri già nella stanza.");
                    return 'INVALID_MOVE';
                }

                
                console.log(`IPOTESI REGISTRATA: ${player.name} accusa ${suspectId} in ${currentRoom}`);

                // 5. TELETRASPORTO DEL SOSPETTATO 
                const accusedPlayerKey = Object.keys(G.players).find(
                    key => G.players[key].character === suspectId || G.players[key].name === suspectId
                );

                if (accusedPlayerKey) {
                    const accusedPlayer = G.players[accusedPlayerKey];
                    if (accusedPlayer.id !== playerID) {
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
                          console.log(`TELETRASPORTO: ${accusedPlayer.name} trascinato in ${currentRoom}`);
                      } else {
                          console.log(`! ${accusedPlayer.name} era già nella stanza. Nessun bonus movimento.`);
                      }
                  }
                }  

                
                // 7. FINE FASE ATTIVA
                // Il turno non finisce, ma entra nella fase "Smentita".

                // CERCA SMENTITORE (Auto-Skip) 
                // Invece di assegnare semplicemente il prossimo giocatore, usiamo la funzione definita in utils/logic.ts
                
                // Resettiamo eventuali risultati vecchi per pulire l'interfaccia
                G.lastRefutation = null; 

                const result = findNextRefuter(
                    G, 
                    ctx, 
                    Number(playerID), 
                    { s: suspectId, w: weaponId, r: currentRoom }
                );

                if (result) {
                    // CASO A: ABBIAMO TROVATO QUALCUNO CHE PUÒ SMENTIRE
                    console.log(`[SERVER] Smentita richiesta a PlayerID: ${result.playerID}`);

                    G.currentSuggestion = {
                        suggesterId: playerID,      
                        suspect: suspectId as any,
                        weapon: weaponId as any,
                        room: currentRoom as any,
                        
                        currentResponder: result.playerID,
                        matchingCards: result.matchingCards // SALVIAMO LE CARTE CHE PUÒ MOSTRARE
                    };

                    // ATTIVIAMO LO STAGE: Il gioco si congela e tocca solo a result.playerID
                    events.setActivePlayers({
                        value: {
                            [result.playerID]: 'refutationStage' 
                        }
                    });

                } else {
                    // CASO B: NESSUNO HA LE CARTE (Auto-Skip totale)
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
                
                // events.endTurn(); // TEMPORANEO PER TEST
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

                // 1. Recuperiamo la Soluzione dalla Busta Gialla
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
                    suspectId: realSuspect, 
                    weaponId: realWeapon, 
                    roomId: realRoom 
                };

                // 3. Logica di Vittoria o Sconfitta
                if (isSuspectCorrect && isWeaponCorrect && isRoomCorrect) {
                  // VITTORIA
                  console.log(`[SERVER] VITTORIA! ${player.name} ha risolto il caso.`);
                  
                  // Termina immediatamente la partita dichiarando il vincitore.
                  // Passiamo anche la soluzione per poterla mostrare a tutti nella schermata di Game Over.
                  events.endGame({
                    winner: playerID,
                    solution: realSolution // Passiamo la soluzione vera (che coincide con l'accusa, ma per sicurezza usiamo quella della busta)
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

                // 3. FINE DEL TURNO
                // Poiché siamo nel turno del "Suggester" (ma sta agendo il "Refuter"),
                // chiamare endTurn() chiude il turno del Suggester e passa la mano al prossimo.
                // events.endTurn(); 
                
                // Puliamo anche i giocatori attivi speciali
                events.setActivePlayers({ value: {} });
            }
        }
      }
    }
  },
  
  // // Condizioni di vittoria/fine
  // endIf: (G, ctx) => {
  //   // Logica vittoria (da implementare dopo)
  // }
};