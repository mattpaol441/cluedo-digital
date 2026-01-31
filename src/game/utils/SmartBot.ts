import { Bot } from 'boardgame.io/ai';
import { SUSPECTS, WEAPONS, ROOMS, DOOR_MAPPING } from '@cluedo-digital/shared';

export class SmartBot extends Bot {
  private delay: number;
  private knownCards: Set<string>;
  private solutionCandidates: {
    suspects: string[];
    weapons: string[];
    rooms: string[];
  };

  constructor({ enumerate, seed, delay }: any) {
    super({ enumerate, seed });
    this.delay = delay || 1000;
    this.knownCards = new Set();
    
    this.solutionCandidates = {
      suspects: SUSPECTS.map(s => s.id),
      weapons: WEAPONS.map(w => w.id),
      rooms: ROOMS.map(r => r.id),
    };
  }

  private updateMemory(G: any, playerID: string) {
    const player = G.players[playerID];
    
    // 1. Aggiungo le mie carte iniziali
    player.hand.forEach((c: any) => this.knownCards.add(c.id));

    // 2. Aggiungo carte viste dalle smentite
    if (G.lastRefutation && String(G.lastRefutation.suggesterId) === playerID) {
      if (G.lastRefutation.cardShown) {
        this.knownCards.add(G.lastRefutation.cardShown.id);
      }
    }

    // 3. Ricalcolo i candidati
    this.solutionCandidates.suspects = SUSPECTS.map(s => s.id).filter(id => !this.knownCards.has(id));
    this.solutionCandidates.weapons = WEAPONS.map(w => w.id).filter(id => !this.knownCards.has(id));
    this.solutionCandidates.rooms = ROOMS.map(r => r.id).filter(id => !this.knownCards.has(id));
  }

  async play(state: any, playerID: string) {
    const { G, ctx } = state;

    // 0. CHECK PRELIMINARE
    const isMyTurn = ctx.currentPlayer === playerID;
    const suggestion = G.currentSuggestion;
    const isMyRefutation = suggestion && String(suggestion.currentResponder) === playerID;

    if (!isMyTurn && !isMyRefutation) {
        return { action: null as any };
    }

    // 1. RITARDO
    console.log(`[SmartBot ${playerID}] Ragiono... (Delay: ${this.delay}ms)`);
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    // 2. AGGIORNO MEMORIA
    this.updateMemory(G, playerID);

    // 3. RECUPERO MOSSE
    const moves = this.enumerate(G, ctx, playerID);
    
    // Check di sicurezza: se moves è vuoto, restituisci null action per evitare crash
    if (!moves || moves.length === 0) {
        // Se non ho mosse ma pensavo toccasse a me, stampo un warning ma non rompo il gioco
        console.warn(`[SmartBot ${playerID}] Nessuna mossa trovata.`);
        return { action: null as any };
    }

    // --- LOGICA DECISIONALE ---

    // A. DEVO SMENTIRE?
    if (isMyRefutation) {
       const move = moves[0];
       return { action: move, metadata: {} };
    }

    // B. SOLUZIONE TROVATA? (Endgame)
    const solvedSuspect = this.solutionCandidates.suspects.length === 1;
    const solvedWeapon = this.solutionCandidates.weapons.length === 1;
    const solvedRoom = this.solutionCandidates.rooms.length === 1;
    const knowsSolution = solvedSuspect && solvedWeapon && solvedRoom;

    if (knowsSolution) {
        console.log(`[SmartBot ${playerID}] !!! HO LA SOLUZIONE !!! -> ${this.solutionCandidates.suspects[0]}, ${this.solutionCandidates.weapons[0]}, ${this.solutionCandidates.rooms[0]}`);
        
        // Cerco la mossa 'makeAccusation' nel payload
        const accusaMove = moves.find((m: any) => m.payload && m.payload.type === 'makeAccusation');
        
        if (accusaMove) {
             // FIX: Accediamo a payload.args con il cast ad any
             (accusaMove as any).payload.args = [
                this.solutionCandidates.suspects[0],
                this.solutionCandidates.weapons[0],
                this.solutionCandidates.rooms[0]
             ];
             return { action: accusaMove, metadata: {} };
        }
    }

    // C. FASE IPOTESI SMART
    // Cerco la mossa 'makeHypothesis' nel payload
    const hypothesisMove = moves.find((m: any) => m.payload && m.payload.type === 'makeHypothesis');
    
    if (hypothesisMove) {
        const sIndex = Math.floor(Math.random() * this.solutionCandidates.suspects.length);
        const wIndex = Math.floor(Math.random() * this.solutionCandidates.weapons.length);
        
        const suspect = this.solutionCandidates.suspects[sIndex];
        const weapon = this.solutionCandidates.weapons[wIndex];
        
        console.log(`[SmartBot ${playerID}] Ipotesi Smart: ${suspect}, ${weapon}`);
        
        // FIX: Sovrascriviamo gli argomenti dentro il payload
        (hypothesisMove as any).payload.args = [suspect, weapon];
        return { action: hypothesisMove, metadata: {} };
    }

    // D. FASE MOVIMENTO (Priorità Stanze)
    // Cerco le mosse 'movePawn' nel payload
    const moveActions = moves.filter((m: any) => m.payload && m.payload.type === 'movePawn');
    
    if (moveActions.length > 0) {
        // 1. FILTRO INTELLIGENTE: Cerco mosse che portano a una porta NUOVA
        const roomMoves = moveActions.filter((m: any) => {
            const [x, y] = m.payload.args;
            const coordKey = `${x},${y}`;
            
            // Qual è la stanza target di questa coordinata?
            const targetRoomId = DOOR_MAPPING[coordKey];
            
            // Se non è una porta, scartala da questo filtro specifico
            if (!targetRoomId) return false;

            // FIX: Se la stanza target è la STESSA in cui sono ora, scartala!
            // Il bot deve uscire dalla stanza, non rientrarci subito.
            if (G.players[playerID].currentRoom === targetRoomId) {
                return false; 
            }

            return true;
        });

        // 2. SE ESISTE UNA STANZA DIVERSA, VACCI!
        if (roomMoves.length > 0) {
            console.log(`[SmartBot ${playerID}] Ho trovato una nuova stanza! Entro.`);
            const selectedRoomMove = roomMoves[Math.floor(Math.random() * roomMoves.length)];
            return { action: selectedRoomMove, metadata: {} };
        }

        // 3. ALTRIMENTI, VADO A CASO NEL CORRIDOIO
        // Nota: Qui prendiamo tutte le mosse disponibili. Se l'unica mossa valida fosse rientrare
        // (es. bloccato da altri player), moveActions conterrebbe quella mossa.
        // Tuttavia, di solito moveActions contiene caselle corridoio.
        console.log(`[SmartBot ${playerID}] Vago nel corridoio.`);
        
        // Opzionale: Se vuoi evitare che il bot si blocchi provando a rientrare nella stanza anche nel fallback random,
        // puoi filtrare moveActions per rimuovere le porte della stanza corrente.
        const validCorridorMoves = moveActions.filter((m: any) => {
             const [x, y] = m.payload.args;
             const targetRoomId = DOOR_MAPPING[`${x},${y}`];
             // Accetto se NON è una porta OPPURE se è una porta di un'ALTRA stanza
             return !targetRoomId || targetRoomId !== G.players[playerID].currentRoom;
        });

        // Se dopo il filtro ho ancora mosse, ne uso una, altrimenti uso quelle grezze (caso disperato)
        const candidates = validCorridorMoves.length > 0 ? validCorridorMoves : moveActions;
        
        const randomMove = candidates[Math.floor(Math.random() * candidates.length)];
        return { action: randomMove, metadata: {} };
    }

    // E. FALLBACK
    const defaultMove = moves[0];
    
    // FIX LOG: Usiamo payload.type per il nome della mossa
    console.log(`[SmartBot ${playerID}] Eseguo:`, (defaultMove as any).payload?.type || 'unknown');

    return { action: defaultMove, metadata: {} };
  }
}