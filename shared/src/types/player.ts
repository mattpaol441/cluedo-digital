// shared/src/types/player.ts
import { SuspectID, Card } from './models.js';
import { Coordinate } from './board.js';

// Il Taccuino: Mappa ID carta -> Stato (true = scartato/visto, false/undefined = possibile)
export type NotebookState = Record<string, boolean>;

export interface Player {
  id: string;             // ID di boardgame.io ("0", "1", ecc.)
  name: string;           // Nome utente (es. "Mario")
  color: string;          // Colore associato (es. "#FF0000")
  character: SuspectID;   // Il personaggio interpretato (es. "mustard")
  
  // Posizione corrente sulla griglia
  position: Coordinate;
  
  // Se è dentro una stanza, salviamo anche l'ID della stanza per facilitare la logica
  currentRoom?: string; // Es. 'kitchen' o undefined se è in corridoio

  hand: Card[];           // Le carte in mano (PRIVATE)
  // notebook: NotebookState;// Gli appunti del detective (PRIVATI). ASSOLUTAMENTE mettere il taccuino in G appesantisce il server e rischia la privacy. Già gestito altrove. 
  
  isEliminated: boolean;  // Se ha sbagliato l'accusa finale è fuori

  // true = Sono stato spostato qui da un avversario durante un'ipotesi fatta da quell'avversario verso di me.
  // false = Sono arrivato qui con le mie gambe (o ho già finito il turno).
  // Logica di Gioco (Game.ts):
  // - All'inizio del mio turno, se questo è true:
  //   Il gioco mi permette di scegliere tra "Tira Dadi" e "Fai Ipotesi (senza muovere)".
  // - Se scelgo "Tira Dadi": il flag diventa false e mi muovo.
  // - Se scelgo "Fai Ipotesi": il flag diventa false e passo alla fase 'suggestion'.
  wasMovedBySuggestion: boolean;
}