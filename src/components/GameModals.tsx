import React from 'react';
import type { CluedoGameState } from '@cluedo-digital/shared';
import type { Ctx } from 'boardgame.io';

import { AccusationModal } from './AccusationModal';
import { GameOverModal } from './GameOverModal';      
import { EliminationModal } from './EliminationModal'; 

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

  // 2. MODALE ACCUSA
  const showAccusation = 
      ctx.currentPlayer === playerID && 
      myPlayer.currentRoom === 'CENTER_ROOM' &&
      !myPlayer.isEliminated;

  if (showAccusation) {
    return (
      <AccusationModal 
        onSubmit={(s, w, r) => moves.makeAccusation(s, w, r)} // L'utente preme il bottone rosso "APRI BUSTA". Qui scatta l'evento onSubmit. React esegue: moves.makeAccusation('mustard', 'rope', 'hall').
      />
    );
  }

  // 3. BANNER ELIMINAZIONE
  // Nota: Questo non è un "return" esclusivo se vuoi mostrare altro insieme, 
  // ma per ora va bene così o puoi usare un React Fragment <></> per ritornare più cose.
  if (myPlayer.isEliminated) {
     return <EliminationModal />;
  }

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