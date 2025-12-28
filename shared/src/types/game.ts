import { Card, WeaponID } from "./models";
import { PlayerState } from "./player";
import { RoomID, SuspectID } from "./types";

export interface SuggestionState {
    accuserPlayerId: string;
    suspect: SuspectID;
    weapon: WeaponID;
    room: RoomID;
    refutedBy?: string; // Player ID who refuted, or null if none
    refutationCard?: Card;    // The card used to refute, if any
}

export interface CluedoGameState {
    secretEnvelope?: {
        suspect: Card;
        weapon: Card;
        room: Card;
    };
    players: Record<string, PlayerState>;
    diceRoll: [number, number];
    currentSuggestion?: SuggestionState;
    tableCards: Card[];
}