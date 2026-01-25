// Definisce i "contratti" (tipi) TypeScript per tutto il sistema amicizia
// Interfacce per Firestore e stato Redux
// Costituisce il vocabolario condiviso che tutti gli altri file usano per comunicare.
// Tutti i file del sistema amicizia importano questi tipi. Costituisce la "fonte di verità" per le strutture dati.

import type { Timestamp } from 'firebase/firestore';

// AMICIZIE


// Rappresenta un'amicizia tra due utenti in Firestore.
// Gli UID sono sempre ordinati alfabeticamente per evitare duplicati (per garantire che l'amicizia A<->B sia sempre memorizzata come un solo documento, non due).
export interface Friendship {
    id: string;
    users: [string, string]; // [uid1, uid2] ordinati alfabeticamente
    createdAt: Timestamp;
}

// Profilo amico con stato online (per UI, utilizzato nella lista degli amici visualizzata)
export interface FriendProfile {
    uid: string;
    displayName: string;
    avatarUrl?: string;
    isOnline: boolean;
}

// RICHIESTE DI AMICIZIA

// Stati possibili per una richiesta di amicizia
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

// Richiesta di amicizia tra utenti con stato (pending, accepted, rejected), timestamp e info del mittente.
export interface FriendRequest {
    id: string;
    fromUID: string;
    fromName: string;
    fromAvatar?: string;
    toUID: string;
    toName?: string;
    status: FriendRequestStatus;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

// INVITI LOBBY

// Stati possibili per un invito a lobby 
export type LobbyInviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// Invito a una lobby di gioco con roomCode, stato e expiresAt (scade dopo 10 minuti).
export interface LobbyInvite {
    id: string;
    fromUID: string;
    fromName: string;
    fromAvatar?: string;
    toUID: string;
    roomCode: string;
    status: LobbyInviteStatus;
    createdAt: Timestamp;
    expiresAt: Timestamp;
}

// HELPER PER CREAZIONE AMICIZIA

// Genera un ID amicizia deterministico ordinando gli UID
// Garantisce che A-B e B-A producano lo stesso ID
export function createFriendshipId(uid1: string, uid2: string): string {
    const sorted = [uid1, uid2].sort();
    return `${sorted[0]}_${sorted[1]}`;
}

// Ordina due UID alfabeticamente per la struttura Friendship definita sopra. Ritorna la tupla ordinata per il campo users.
export function sortUserIds(uid1: string, uid2: string): [string, string] {
    const sorted = [uid1, uid2].sort();
    return [sorted[0], sorted[1]];
}
