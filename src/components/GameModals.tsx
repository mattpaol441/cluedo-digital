import React, { useState, useEffect } from 'react';
import type { CluedoGameState } from '@cluedo-digital/shared';
import type { Ctx } from 'boardgame.io';

import { AccusationModal } from './AccusationModal';
import { GameOverModal } from './GameOverModal';      
import { EliminationModal } from './EliminationModal';
import { HypothesisModal } from './HypothesisModal';
import { TurnChoiceModal } from './TurnChoiceModal'; 

interface GameModalsProps {
  G: CluedoGameState;
  ctx: Ctx;
  moves: any;
  playerID: string | null;
}

// È qui che vengono definiti i possibili modali che escono in una partita, e sempre qui il codice capisce "quale modale mostrare". Il componente riceve i dati e esegue una serie di controlli (IF) in ordine di priorità. 
// Se GameModals decide di ritornare <AccusationModal />, React prende quel pezzo di UI e lo "incolla" dentro GamePage esattamente dove abbiamo posizionato il tag <GameModals />.
// Poiché GameModals è posizionato all'inizio del div di GamePage ed ha css fixed o absolute, apparirà sopra a tutto il resto.

export const GameModals: React.FC<GameModalsProps> = ({ G, ctx, moves, playerID }) => {

  // STATI LOCALI PER LA SCELTA DEL TURNO (BIVIO IPOTESI/MOVIMENTO)
  // Questi stati servono per ricordare la scelta fatta dall'utente nel TurnChoiceModal.
  // Una volta che l'utente fa la scelta, il modale scompare e compare l'altro modale (HypothesisModal o il lancio dei dadi per il movimento).
  // 'decisionMade': diventa true appena l'utente clicca su un bottone del bivio
  const [decisionMade, setDecisionMade] = useState(false);
  // 'wantsToInvestigate': diventa true se l'utente sceglie la lente d'ingrandimento
  const [wantsToInvestigate, setWantsToInvestigate] = useState(false);

  // RESET QUANDO CAMBIA IL TURNO 
  // Ogni volta che cambia il giocatore corrente, resettiamo la memoria delle scelte
  useEffect(() => {
    setDecisionMade(false);
    setWantsToInvestigate(false);
  }, [ctx.currentPlayer]);


  const myPlayer = playerID ? G.players[playerID] : null;

  // 1. PRIORITÀ ASSOLUTA: GAME OVER
  // Se la partita è finita, copriamo tutto.
  if (ctx.gameover) {
    const winnerName = G.players[ctx.gameover.winner]?.name || 'Sconosciuto';
    return (
        <GameOverModal 
            winnerName={winnerName} 
            solution={ctx.gameover.solution} 
        />
    );
  }

  // Se non ho un player (spettatore), non mostro altro
  if (!myPlayer) return null;

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
  
  // A. Ingresso Standard: Mi sono mosso con i dadi ed entrato in stanza
  const enteredManually = (ctx.numMoves || 0) > 0;
  
  // B. Ingresso Passivo: Sono stato trascinato (e non ho ancora mosso i dadi)
  const wasDraggedHere = myPlayer.wasMovedBySuggestion && !enteredManually;

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
      (enteredManually || (wasDraggedHere && wantsToInvestigate));

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

  // // 3. BANNER ELIMINAZIONE
  // // Nota: Questo non è un "return" esclusivo se vuoi mostrare altro insieme, 
  // // ma per ora va bene così o puoi usare un React Fragment <></> per ritornare più cose.
  // if (myPlayer.isEliminated) {
  //    return <EliminationModal />;
  // }

  // ... Qui aggiungerai HypothesisModal, RevealCardModal, etc.
 
  // --- LOGICA 2: FORMULAZIONE IPOTESI ---
  // Esempio: Se sono in una stanza, è il mio turno, e NON ho ancora fatto ipotesi
  /*
  const showHypothesis = 
      ctx.currentPlayer === playerID &&
      myPlayer.currentRoom && 
      myPlayer.currentRoom !== 'CENTER_ROOM' &&
      !G.currentSuggestion; // Se non c'è già un'ipotesi in corso

  if (showHypothesis) {
     return <HypothesisModal ... />;
  }
  */

  // --- LOGICA 3: SMENTITA (Mostra Carta) ---
  // Esempio: Se c'è un'ipotesi attiva E tocca a me smentire
  /*
  const showReveal = 
      G.currentSuggestion &&
      ctx.activePlayers?.[playerID] === 'respondToSuggestion'; // Usa gli Stage di boardgame.io
      
  if (showReveal) {
     return <RevealCardModal ... />;
  }
  */

  // Se nessuna condizione è vera, non mostrare nulla
  return null;
};