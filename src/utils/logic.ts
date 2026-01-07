import type { CluedoGameState } from '@cluedo-digital/shared'; 

/**
 * Cerca il prossimo giocatore in senso orario che possiede almeno una delle carte ipotizzate.
 * Ritorna l'ID del giocatore e la lista degli ID delle carte che matchano.
 */
export function findNextRefuter(
    G: CluedoGameState, 
    ctx: any, 
    startPlayerIndex: number, 
    suggestion: { s: string, w: string, r: string }
) {
    const numPlayers = ctx.numPlayers;
    
    // Giriamo per tutti i giocatori in senso orario
    for (let i = 1; i < numPlayers; i++) {
        const nextPlayerID = ((startPlayerIndex + i) % numPlayers).toString();
        const nextPlayer = G.players[nextPlayerID];

        // Se è eliminato, lo saltiamo
        if (nextPlayer.isEliminated) continue;
        
        // Poiché hand contiene oggetti Card, dobbiamo controllare card.id
        // Usiamo .map alla fine per restituire solo un array di stringhe (ID)
        const matchingCards = nextPlayer.hand
            .filter(card => 
                card.id === suggestion.s || 
                card.id === suggestion.w || 
                card.id === suggestion.r
            )
            .map(card => card.id); // Trasformiamo gli oggetti Card in stringhe ID

        if (matchingCards.length > 0) {
            return { 
                playerID: nextPlayerID, 
                matchingCards: matchingCards 
            };
        }
    }
    return null; // Nessuno ha le carte
}