import React, { useState, useEffect } from 'react';
import type { CluedoGameState } from '@cluedo-digital/shared';
import type { Ctx } from 'boardgame.io';


import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/uiSlice';
import { ROOMS } from '@cluedo-digital/shared'; // Per il nome della stanza

import { AccusationModal } from './AccusationModal';
import { GameOverModal } from './GameOverModal';      
import { EliminationModal } from './EliminationModal';
import { HypothesisModal } from './HypothesisModal';
import { TurnChoiceModal } from './TurnChoiceModal';
import { RefutationModal } from './RefutationModal'; 

interface GameModalsProps {
  G: CluedoGameState;
  ctx: Ctx;
  moves: any;
  events?: any;
  playerID: string | null;
}

// È qui che vengono definiti i possibili modali che escono in una partita, e sempre qui il codice capisce "quale modale mostrare". Il componente riceve i dati e esegue una serie di controlli (IF) in ordine di priorità. 
// Se GameModals decide di ritornare <AccusationModal />, React prende quel pezzo di UI e lo "incolla" dentro GamePage esattamente dove abbiamo posizionato il tag <GameModals />.
// Poiché GameModals è posizionato all'inizio del div di GamePage ed ha css fixed o absolute, apparirà sopra a tutto il resto.

export const GameModals: React.FC<GameModalsProps> = ({ G, ctx, moves, playerID, events }) => { // Definizione del componente GameModals
  const dispatch = useAppDispatch(); // Inizializziamo il dispatch di Redux per inviare azioni

  // STATI LOCALI PER LA SCELTA DEL TURNO (BIVIO IPOTESI/MOVIMENTO)
  // Questi stati servono per ricordare la scelta fatta dall'utente nel TurnChoiceModal per gestire la logica dei modali dinamici e delle notifiche, senza sporcare lo stato globale del gioco.
  // Una volta che l'utente fa la scelta, il modale scompare e compare l'altro modale (HypothesisModal o il lancio dei dadi per il movimento).
  // 'decisionMade': diventa true appena l'utente clicca su un bottone del bivio
  const [decisionMade, setDecisionMade] = useState(false); // infatti decisionMade indica se l’utente ha già scelto tra muoversi o indagare nel modale di bivio (TurnChoiceModal).
  const [wantsToInvestigate, setWantsToInvestigate] = useState(false); // wantsToInvestigate invece indica se l’utente ha scelto di fare un’ipotesi (indagare) nel modale di bivio.

  const [showRefutationResult, setShowRefutationResult] = useState(false); // Stato per mostrare il risultato della smentita dopo che è avvenuta
  const [notifiedPlayers, setNotifiedPlayers] = useState<Set<string>>(new Set()); // Stato per tenere traccia dei giocatori già notificati per lo spostamento da suggerimento per evitare notifiche duplicate

  // RESET QUANDO CAMBIA IL TURNO 
  // Resettiamo la memoria delle scelte
  useEffect(() => {
    setDecisionMade(false);
    setWantsToInvestigate(false);
  }, [ctx.currentPlayer]); // Ogni volta che cambia il giocatore corrente

  useEffect(() => {
    // Controlla scorrendo/ciclando su ogni giocatore.... 
    Object.values(G.players).forEach((player) => {
      if (player.wasMovedBySuggestion && !notifiedPlayers.has(player.id)) { // Se un giocatore é stato spostato da un suggerimento e non é già stato notificato....
        const room = ROOMS.find(r => r.id === player.currentRoom); // Trova il nome della stanza in cui é stato spostato
        
        dispatch( // Manda a tutti una notifica che segnala che il giocatore é stato spostato
          addNotification({
            message: `${player.name} è stato spostato in ${room?.name || 'sconosciuto'}!`,
            type: 'warning',
            duration: 4000,
          })
        );

        // Marca come notificato, aggiungendo l'id del giocatore all'insieme dei notificati, per evitare notifiche duplicate
        setNotifiedPlayers(prev => new Set(prev).add(player.id));
      }
    });

    // IMPORTANTE: Se un giocatore NON è più trascinato, lo rimuoviamo da notifiedPlayers
    // Così se lo trascinano di nuovo in un turno futuro, sarà notificato di nuovo
    setNotifiedPlayers(prev => { // Modifico l'insieme dei notificati usando prev, funzione che riceve il valore precedente di notifiedPlayers  
      const updated = new Set(prev); // Creo una copia dell'insieme precedente, così da non modificarlo direttamente (immutabilità)
      Object.values(G.players).forEach(player => { // Ciclando su ogni giocatore....
        if (!player.wasMovedBySuggestion) { // Se il giocatore non é stato spostato da un'ipotesi (non é trascinato)
          updated.delete(player.id); // Non é più tra i notificati, così da poter essere notificato di nuovo in futuro
        }
      });
      return updated; // Restituisce il nuovo valore di stato per notifiedPlayers
    });
  }, [G.players, dispatch, notifiedPlayers]); // Ogni volta che cambia G.players, dispatch o notifiedPlayers

  useEffect(() => { // Mostra il risultato della smentita 
    if (G.lastRefutation) { // Se qualcuno ha smentito un'ipotesi  
      setShowRefutationResult(true); // Imposta showRefutationResult a true per mostrare il modale del risultato della smentita
    }
  }, [G.lastRefutation]); // Ogni volta che cambia G.lastRefutation

  // NOTA SU QUESTI STATI:
  // Non li mettiamo in G (stato globale del gioco) perché non servono a tutti i giocatori, ma solo a chi sta giocando (playerID).
  // Inoltre, sono stati "temporanei" che servono solo per gestire l'interfaccia utente e non influenzano le regole del gioco.
  // Metterli in G significherebbe complicare inutilmente lo stato globale del gioco con dati che non interessano a tutti.
  // Sappiamo che quando il giocatore cambia, React fa primo render con vecchi stati, poi esegue l'useEffect che resetta gli stati, e fa un secondo render con gli stati resettati, ma non è un problema perché l'utente non vede nulla in quei due render veloci.
  

  const myPlayer = playerID ? G.players[playerID] : null; // Recupero l’oggetto player corrispondente al playerID attuale

  // PRIORITÀ ASSOLUTA: GAME OVER
  if (ctx.gameover) { // Se la partita é finita
    // Verifichiamo se c'è un vero vincitore (ID non null)
    const hasWinner = ctx.gameover.winner !== null;

    // Se c'é, calcoliamo il nome da mostrare
    const winnerName = hasWinner 
        ? G.players[ctx.gameover.winner]?.name // Prendendo il suo nome dai players
        : "Il colpevole è fuggito!";

    return ( // E ritorno il componente GameOverModal, passando il nome del vincitore, la soluzione e se é vittoria o sconfitta 
        <GameOverModal 
            winnerName={winnerName} 
            solution={ctx.gameover.solution}
            isVictory={hasWinner} 
        />
    );
  }

  // Se non ho un player (spettatore), non mostro altro
  if (!myPlayer) return null; 

  // SMENTITA - Priorità Alta
  // Controlliamo se c'è un suggerimento attivo o se dobbiamo mostrare un risultato
  if (G.currentSuggestion || (G.lastRefutation && showRefutationResult)) { // Se esiste una currentSuggestion (cioé é in corso una fase di smentita) oppure esiste una lastRefutation e lo stato locale showRefutationResult é true (cioé bisogna mostrare il risultato della smentita appena avvenuta)
      return (
          <RefutationModal 
             G={G}
             playerID={playerID}
             moves={moves}
             events={events}
             showResult={showRefutationResult}
             onCloseResult={() => setShowRefutationResult(false)}
          />
      );
  }

  // PRIORITÀ ALTA: SEI ELIMINATO?
  // Spostato qui. Se è eliminato, vede il banner e BASTA.
  // Non deve poter vedere modali di accusa o ipotesi.
  if (myPlayer.isEliminated) {
     return <EliminationModal />;
  }



  // VARIABILI COMUNI PER I CONTROLLI
  const isMyTurn = ctx.currentPlayer === playerID; // True se é il turno del giocatore corrente
  
  // LOGICA FORMULAZIONE IPOTESI 
  // Requisiti:
  // A. È il mio turno
  // B. Sono in una stanza vera (non corridoio, non centro)
  // C. Non ho ancora fatto un'ipotesi in questo turno (!G.currentSuggestion)
  // D. REGOLA CRITICA: Ho lanciato i dadi (numMoves > 0) OPPURE sono stato trascinato qui (wasMovedBySuggestion)
  
  const isInRoom = myPlayer.currentRoom && myPlayer.currentRoom !== 'CENTER_ROOM'; // True se il giocatore é in una stanza (non centro)
  const suggestionNotMadeYet = !G.currentSuggestion; // True se non esiste una currentSuggestion (non ho ancora fatto un'ipotesi in questo turno)
  
  /// FIX CRITICO:
  // Prima usavamo: const enteredManually = (ctx.numMoves || 0) > 0;
  // Questo era sbagliato perché ctx.numMoves scatta appena tiri i dadi.
  // Ora usiamo la variabile specifica del giocatore che diventa true SOLO DOPO che il giocatore é entrato nella stanza camminando
  const hasEnteredRoom = myPlayer.enteredManually; 
  
  // Ingresso Passivo, sono stato trascinato (e non sono entrato a piedi)
  const wasDraggedHere = myPlayer.wasMovedBySuggestion && !hasEnteredRoom;

  // SCENARIO 1: MODALE DI SCELTA (BIVIO)
  // Mostra SE: 
  // 1. È il mio turno e sono in una stanza
  // 2. Sono stato trascinato qui (wasDraggedHere)
  // 3. NON ho ancora preso una decisione (!decisionMade)
  if (isMyTurn && isInRoom && suggestionNotMadeYet && wasDraggedHere && !decisionMade) { // Se le condizioni passano, mostra il modale di bivio scelta 
      return (
          <TurnChoiceModal
              currentRoomId={myPlayer.currentRoom!} // Il ! è sicuro (isInRoom è true) 
              onChooseMove={() => {
                  setDecisionMade(true);      // Ho deciso...
                  setWantsToInvestigate(false); // ...di muovermi. (Il componente fa un nuovo render perché é cambiato lo stato locale, chiude modale, vedo mappa)
              }}
              onChooseHypothesis={() => {
                  setDecisionMade(true);      // Ho deciso...
                  setWantsToInvestigate(true); // ...di indagare. (Passa al modale Ipotesi)
              }}
          />
      );
  }

  // SCENARIO 2: MODALE IPOTESI VERO E PROPRIO
  // Mostra SE:
  // 1. Condizioni base (Turno, Stanza, Niente Ipotesi fatta)
  // 2. E INOLTRE una delle due condizioni valide:
  //    - O sono entrato manualmente camminando (enteredManually)
  //    - O sono stato trascinato MA ho scelto esplicitamente di indagare (wantsToInvestigate)
  
  const showHypothesis = 
      isMyTurn && // È il mio turno
      isInRoom && // Sono in una stanza
      suggestionNotMadeYet && // Non ho ancora fatto un'ipotesi in questo turno
      (hasEnteredRoom || (wasDraggedHere && wantsToInvestigate)); // Sono entrato camminando oppure sono stato trascinato e ho scelto di indagare

  if (showHypothesis) {
     return (
       <HypothesisModal 
          currentRoomId={myPlayer.currentRoom!} // Sicuro perché isInRoom è true
          onSubmit={(s, w) => moves.makeHypothesis(s, w)}
       />
     );
  }

  // MODALE ACCUSA (Busta Gialla)
  const showAccusation = 
      isMyTurn && 
      myPlayer.currentRoom === 'CENTER_ROOM';
      // Nota: !myPlayer.isEliminated è già gestito in alto

  if (showAccusation) {
    return (
      <AccusationModal 
        onSubmit={(s, w, r) => moves.makeAccusation(s, w, r)} 
      />
    );
  }

  // Se nessuna condizione è vera, non mostrare nulla
  return null;
};