import { Card, WeaponID } from "./models.js";
import { Player } from "./player.js";
import { RoomID, SuspectID } from "./models.js";

export interface SuggestionState {
    suggesterId: string;
    suspect: SuspectID;
    weapon: WeaponID;
    room: RoomID;
    
    // STATO DELL'INTERROGATORIO 
    // Questo è indispensabile per dire: "Ok, Mario ha chiesto. Luigi ha passato. Ora tocca a X rispondere." Non può essere rimosso, altrimenti non c'è la gestione del "passaggio della patata bollente" tra i vari giocatori.
    currentResponder: string | null; // Lasciare l'utilizzo di null per dire 'Nessuno sta facendo un'ipotesi ora'
    matchingCards: string[];  // Le carte che PUÒ mostrare
}

    // RISULTATO FINALE (Cosa mostriamo alla fine)
    export interface RefutationResult {
        suggesterId: string;      // A chi mostriamo la carta segreta
        refuterId: string | null; // Chi ha smentito (o null se nessuno aveva carte)
        cardShown: Card | null;   // La carta (visibile solo al suggesterId)
    }

export interface CluedoGameState { // Da verificare se va bene così
    // secretEnvelope?: {  // Qui non ci va il punto interrogativo perché questa parte è obbligatoria e sempre presente nel gioco. La cosa migliore sarebbe 'secretEnvelope: Card[];' senza l'oggetto.
    //     // Se l'oggetto serve, comunque non dovrebbe mai essere undefined (cosa che accade con il punto interrogativo)
    //     suspect: Card;
    //     weapon: Card;
    //     room: Card;
    // };
    secretEnvelope: Card[]; // Le 3 carte della soluzione (Busta Gialla)
    players: Record<string, Player>;
    diceRoll: [number, number];
    currentSuggestion: SuggestionState | null;
    lastRefutation: RefutationResult | null;
    tableCards: Card[];
}