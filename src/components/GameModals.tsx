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

export const GameModals: React.FC<GameModalsProps> = ({ G, ctx, moves, playerID, events }) => {
  const dispatch = useAppDispatch();

  // STATI LOCALI PER LA SCELTA DEL TURNO (BIVIO IPOTESI/MOVIMENTO)
  // Questi stati servono per ricordare la scelta fatta dall'utente nel TurnChoiceModal.
  // Una volta che l'utente fa la scelta, il modale scompare e compare l'altro modale (HypothesisModal o il lancio dei dadi per il movimento).
  // 'decisionMade': diventa true appena l'utente clicca su un bottone del bivio
  const [decisionMade, setDecisionMade] = useState(false);
  // 'wantsToInvestigate': diventa true se l'utente sceglie la lente d'ingrandimento
  const [wantsToInvestigate, setWantsToInvestigate] = useState(false);

  const [showRefutationResult, setShowRefutationResult] = useState(false);
  const [notifiedPlayers, setNotifiedPlayers] = useState<Set<string>>(new Set());

  // RESET QUANDO CAMBIA IL TURNO 
  // Ogni volta che cambia il giocatore corrente, resettiamo la memoria delle scelte
  useEffect(() => {
    setDecisionMade(false);
    setWantsToInvestigate(false);
  }, [ctx.currentPlayer]);

  useEffect(() => {
    // Controlla ogni giocatore quando G.players cambia
    Object.values(G.players).forEach((player) => {
      // Se è stato mosso E non l'hai già notificato
      if (player.wasMovedBySuggestion && !notifiedPlayers.has(player.id)) {
        const room = ROOMS.find(r => r.id === player.currentRoom);
        
        dispatch(
          addNotification({
            message: `${player.name} è stato spostato in ${room?.name || 'sconosciuto'}!`,
            type: 'warning',
            duration: 4000,
          })
        );

        // Marca come notificato
        setNotifiedPlayers(prev => new Set(prev).add(player.id));
      }
    });

    // IMPORTANTE: Se un giocatore NON è più trascinato, lo rimuoviamo da notifiedPlayers
    // Così se lo trascinano di nuovo in un turno futuro, sarà notificato di nuovo
    setNotifiedPlayers(prev => {
      const updated = new Set(prev);
      Object.values(G.players).forEach(player => {
        if (!player.wasMovedBySuggestion) {
          updated.delete(player.id);
        }
      });
      return updated;
    });
  }, [G.players, dispatch, notifiedPlayers]);

  useEffect(() => {
    if (G.lastRefutation) {
      setShowRefutationResult(true);
    }
  }, [G.lastRefutation]);

  // NOTA SU QUESTI STATI:
  // Non li mettiamo in G (stato globale del gioco) perché non servono a tutti i giocatori, ma solo a chi sta giocando (playerID).
  // Inoltre, sono stati "temporanei" che servono solo per gestire l'interfaccia utente e non influenzano le regole del gioco.
  // Metterli in G significherebbe complicare inutilmente lo stato globale del gioco con dati che non interessano a tutti.
  // Sappiamo che quando il giocatore cambia, React fa primo render con vecchi stati, poi esegue l'useEffect che resetta gli stati, e fa un secondo render con gli stati resettati, ma non è un problema perché l'utente non vede nulla in quei due render veloci.
  

  const myPlayer = playerID ? G.players[playerID] : null;

  // 1. PRIORITÀ ASSOLUTA: GAME OVER
  if (ctx.gameover) {
    // Verifichiamo se c'è un vero vincitore (ID non null)
    const hasWinner = ctx.gameover.winner !== null;

    // Calcoliamo il nome da mostrare
    const winnerName = hasWinner 
        ? G.players[ctx.gameover.winner]?.name 
        : "Il colpevole è fuggito!";

    return (
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
  if (G.currentSuggestion || (G.lastRefutation && showRefutationResult)) {
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
  const isMyTurn = ctx.currentPlayer === playerID;
  
  // LOGICA FORMULAZIONE IPOTESI 
  // Requisiti:
  // A. È il mio turno
  // B. Sono in una stanza vera (non corridoio, non centro)
  // C. Non ho ancora fatto un'ipotesi in questo turno (!G.currentSuggestion)
  // D. REGOLA CRITICA: Ho lanciato i dadi (numMoves > 0) OPPURE sono stato trascinato qui (wasMovedBySuggestion)
  
  const isInRoom = myPlayer.currentRoom && myPlayer.currentRoom !== 'CENTER_ROOM';
  const suggestionNotMadeYet = !G.currentSuggestion;
  
  /// FIX CRITICO:
  // Prima usavamo: const enteredManually = (ctx.numMoves || 0) > 0;
  // Questo era sbagliato perché ctx.numMoves scatta appena tiri i dadi.
  // Ora usiamo la variabile specifica del giocatore che diventa true SOLO DOPO che la pedina è entrata.
  const hasEnteredRoom = myPlayer.enteredManually; 
  
  // B. Ingresso Passivo: Sono stato trascinato (e non sono entrato a piedi)
  const wasDraggedHere = myPlayer.wasMovedBySuggestion && !hasEnteredRoom;

  // SCENARIO 1: MODALE DI SCELTA (BIVIO)
  // Mostra SE: 
  // 1. È il mio turno e sono in una stanza
  // 2. Sono stato trascinato qui (wasDraggedHere)
  // 3. NON ho ancora preso una decisione (!decisionMade)
  if (isMyTurn && isInRoom && suggestionNotMadeYet && wasDraggedHere && !decisionMade) {
      return (
          <TurnChoiceModal
              currentRoomId={myPlayer.currentRoom!} // Il ! è sicuro (isInRoom è true) 
              onChooseMove={() => {
                  setDecisionMade(true);      // Ho deciso...
                  setWantsToInvestigate(false); // ...di muovermi. (Chiude modale, vedo mappa)
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
      isMyTurn && 
      isInRoom && 
      suggestionNotMadeYet && 
      (hasEnteredRoom || (wasDraggedHere && wantsToInvestigate));

  if (showHypothesis) {
     return (
       <HypothesisModal 
          currentRoomId={myPlayer.currentRoom!} // Sicuro perché isInRoom è true
          onSubmit={(s, w) => moves.makeHypothesis(s, w)}
       />
     );
  }

  // --- 6. MODALE ACCUSA (Busta Gialla) ---
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