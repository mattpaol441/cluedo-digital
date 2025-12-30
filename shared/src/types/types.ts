// DEFINIZIONE DEI TIPI DI GIOCO (Domain Modeling)
// Questo file è il "Contratto" che tutto il resto dell'app deve rispettare
// Per definire i Tipi si usano quattro fonti: 
// 1. Le regole ufficiali di Cluedo per le entità fisiche (carte, tabellone, ecc)
// 2. I mockup per capire quali dati servono e cosa cambia durante il gioco
// 3. Il framework per poter includere le funzionalità che non prevede di default ????
// 4. I casi d'uso (es. taccuino, interfaccia, ecc)

// NOTA SULLE CONVENZIONI:
// - Usiamo "id" per identificativi univoci (stringhe senza spazi, es. "mustard")
// - Usiamo "name" per nomi leggibili (es. "Col. Mustard")
// - Usiamo "playerID" per identificare i giocatori nella partita ("0", "1", ecc)

import type { SuggestionState } from "./game.js";
import type { Player } from "./player.js";
import type { Card } from "./models.js";

// --- 1. ENTITÀ DI BASE (Carte e Identificativi) ---

// export type CardType = 'SUSPECT' | 'WEAPON' | 'ROOM';

// export interface Card {
//   id: string;        // Es: "mustard", "candlestick"
//   name: string;      // Es: "Col. Mustard", "Candelabro"
//   type: CardType;
//   image?: string;    // URL dell'asset grafico (opzionale per ora)
// }

// // I 6 Sospettati ufficiali (usati come ID univoci)
// export type SuspectID = 'mustard' | 'plum' | 'green' | 'peacock' | 'scarlet' | 'orchid';

// // --- 2. IL TABELLONE E I GIOCATORI ---

// // Gli ID fissi delle Stanze
// export type RoomID =  'ballroom' | 'billiard_room' | 'conservatory' | 'dining_room' | 'hall' | 'kitchen' | 'library' | 'lounge' | 'study';

// //GridPosition:
// // Una posizione può essere un numero (corridoio) OPPURE un ID stanza
// // Se sono in cucina, position = "kitchen", se sono nel corridoio, position = 142
// export type GridPosition = number | RoomID;


// // NOTA SULLA PEDINA:
// // Ogni giocatore controlla una pedina sul tabellone.
// // Dentro Player abbiamo un campo 'position' che indica dove si trova la pedina e un campo 'character'
// // che indica quale personaggio sta muovendo quel giocatore.
// // La combinazione di Chi (character) e Dove (position) è sufficiente per renderizzare la pedina sulla mappa
// export interface Player {
//   id: string;             // ID di BoardGame.io ("0", "1", "2"...)
//   name: string;           // Nickname dell'utente (es. "Mario")
//   character: SuspectID;   // Quale personaggio sta muovendo (es. "mustard")
//   hand: Card[];           // Le carte che ha in mano (PRIVATE)
//   position: GridPosition; // Dove si trova sul tabellone
//   color: string;          // Codice HEX per i bordi/pedine
//   isEliminated: boolean;  // Se ha sbagliato l'accusa finale
//   // true = Sono stato spostato qui da un avversario durante un'ipotesi fatta da quell'avversario verso di me.
//   // false = Sono arrivato qui con le mie gambe (o ho già finito il turno).
//   // Logica di Gioco (Game.ts):
//   // - All'inizio del mio turno, se questo è true:
//   //   Il gioco mi permette di scegliere tra "Tira Dadi" e "Fai Ipotesi (senza muovere)".
//   // - Se scelgo "Tira Dadi": il flag diventa false e mi muovo.
//   // - Se scelgo "Fai Ipotesi": il flag diventa false e passo alla fase 'suggestion'.
//   wasMovedBySuggestion: boolean;
// }

// // --- 3. MECCANICHE DI TURNO (Ipotesi e Accusa) ---

// // Quando un giocatore fa un'ipotesi, il gioco entra in uno stato di "Interrogatorio"
// export interface SuggestionData {
//   accuser: string;        // PlayerID di chi ha fatto l'ipotesi
//   suspect: string;        // ID Carta Sospettato (es. "plum")
//   weapon: string;         // ID Carta Arma
//   room: string;           // ID Carta Stanza
  
//   // Chi deve rispondere ora?
//   currentResponder: string | null; 
//   // Chi ha smentito l'ipotesi mostrandogli una carta? (null se nessuno)
//   refutedBy: string | null; 

//   // La carta specifica che è stata mostrata per smentire.
//   // Nota Tecnica: BoardGame.io oscurerà automaticamente questo campo 
//   // per tutti i giocatori tranne l'accuser (sarà fatto in Game.ts).
//   refutationCard: Card | null;

// }

// --- 4. STATO GLOBALE DI GIOCO ($G) ---
// Questo è l'oggetto che vive nel Server e che BoardGame.io sincronizza.

// export interface CluedoGameState {
//   // Dati statici della partita
//   secretEnvelope: Card[]; // Le 3 carte della soluzione (Busta Gialla)

//   // Le carte avanzate dalla distribuzione (visibili a tutti)
//   // Es. In 4 giocatori, qui ci saranno 2 carte.
//   tableCards: Card[];
  
//   // Stato dinamico
//   players: Record<string, Player>; // Mappa ID -> Giocatore
  
//   // Movimento
//   dice: [number, number]; // Risultato del lancio (es. [3, 6])
  
//   // Gestione Fasi Complesse
//   // Serve a "bloccare" il gioco finché la fase complessa dell'ipotesi non viene risolta
//   suggestion: SuggestionState | null; // Se null, non c'è un'ipotesi in corso
  
// }

// --- 5. STATO LOCALE (Il Taccuino Semplificato) ---

// NOTA SUL TACCUINO:
// Qui salviamo solo le note MANUALI dell'utente.
// true = Ho messo una X (Scartato).
// false/undefined = Casella vuota (Potenziale colpevole).
// Nota: Le carte in mano e le carte pubbliche verranno aggiunte visivamente
// come 'X' automatiche dal componente React, senza sporcare questo stato.
// è praticamente una lista di cose da spuntare con una X oppure da lasciare vuote
// export type NotebookState = Record<string, boolean>;

// --- 6. Map Definition ---

// // I tipi di terreno possibili sulla mappa
// export type CellType = 
//   | 'FLOOR'  // Corridoio camminabile
//   | 'WALL'   // Muro/Ostacolo
//   | 'ROOM'   // Interno stanza (decorativo)
//   | 'DOOR'   // Passaggio Corridoio <-> Stanza
//   | 'START' // Casella di partenza
//   | 'CENTER'; // La casella speciale per l'Accusa Finale.

// // Definizione di una singola casella della mappa (Dato Statico)
// export interface CellDefinition {
//   type: CellType;p
  
//   // Se è una PORTA, a quale stanza porta? (Es. "kitchen")
//   doorTo?: RoomID; 
  
//   // Se è una PARTENZA, di chi è? (Es. "mustard")
//   startFor?: string;
// }

// // Il tabellone dovrebbe semplicemente essere  un Array di CellDefinition lungo 576 elementi (24x24 o 24x25)

// // Mancano i passaggi segreti, li aggiungiamo dopo se serve


// --- 7. DEFINIZIONE FASI DI GIOCO ---
// Queste stringhe saranno usate dentro ctx.phase per scandire bene le fasi del turno
export type GamePhase = 
  | 'roll'        // 1. Tira i dadi (obbligatorio all'inizio, a meno che non sia stato "trascinato" nel turno di un altro giocatore)
  | 'move'        // 2. Devi muoverti (o usare passaggi segreti, si vedrà più avanti)
  | 'action'      // 3. Sei nella stanza: Ipotesi o Accusa finale?
  | 'suggestion'  // 4. Hai ipotizzato: gli altri devono smentire mostrando qualcosa
  | 'accusation'; // 5. Hai accusato: momento della verità