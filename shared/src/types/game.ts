import { Card, WeaponID } from "./models.js";
import { Player } from "./player.js";
import { RoomID, SuspectID } from "./models.js";

export interface SuggestionState {
    accuserPlayerId: string;
    suspect: SuspectID;
    weapon: WeaponID;
    room: RoomID;
    refutedBy: string | null;    // Chi ha mostrato la carta (o null). 
    refutationCard: Card | null; // La carta mostrata (o null)
    // STATO DELL'INTERROGATORIO 
    // Questo è indispensabile per dire: "Ok, Mario ha chiesto. Luigi ha passato. Ora tocca a X rispondere." Non può essere rimosso, altrimenti non c'è la gestione del "passaggio della patata bollente" tra i vari giocatori.
    currentResponder: string | null; // Lasciare l'utilizzo di null per dire 'Nessuno sta facendo un'ipotesi ora'
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
    tableCards: Card[];
}