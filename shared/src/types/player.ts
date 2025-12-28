// shared/src/types/player.ts
import { SuspectID, Card } from './models';
import { Coordinate } from './board';

// Il Taccuino: Mappa ID carta -> Stato (true = scartato/visto, false/undefined = possibile)
export type NotebookState = Record<string, boolean>;

export interface PlayerState {
  id: string;             // ID di boardgame.io ("0", "1", ecc.)
  name: string;           // Nome utente (es. "Mario")
  color: string;          // Colore associato (es. "#FF0000")
  character: SuspectID;   // Il personaggio interpretato (es. "mustard")
  
  // Posizione corrente sulla griglia
  position: Coordinate;
  
  // Se è dentro una stanza, salviamo anche l'ID della stanza per facilitare la logica
  currentRoom?: string; // Es. 'kitchen' o undefined se è in corridoio

  hand: Card[];           // Le carte in mano (PRIVATE)
  notebook: NotebookState;// Gli appunti del detective (PRIVATI)
  
  isEliminated: boolean;  // Se ha sbagliato l'accusa finale è fuori
}