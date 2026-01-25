// Firebase Lobby Invites Service Layer
// Gestione inviti lobby per amici
// Usato principalmente da friendSlice.ts e useLobbyInvites.ts per la sottoscrizione real-time e l'auto-join.
// A differenza delle richieste amicizia, gli inviti hanno una scadenza temporale. 
// Il filtro viene applicato sia in getPendingInvites che in subscribeToLobbyInvites.

import {
    doc,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { LobbyInvite, LobbyInviteStatus } from '../types';

const INVITES_COLLECTION = 'lobbyInvites';

// Durata validità invito in minuti
const INVITE_EXPIRY_MINUTES = 10;

// INVIO INVITI


// Invia un invito lobby a un amico
// Crea un invito con expiresAt calcolato (10 minuti da ora). Usa Timestamp.fromDate() per creare il timestamp di scadenza.

export async function sendLobbyInvite(
    fromUID: string,
    fromName: string,
    fromAvatar: string | undefined,
    toUID: string,
    roomCode: string
): Promise<string> {
    // Calcola timestamp di scadenza
    const now = new Date();
    const expiresAt = Timestamp.fromDate(
        new Date(now.getTime() + INVITE_EXPIRY_MINUTES * 60 * 1000)
    );

    const inviteRef = doc(collection(db, INVITES_COLLECTION));

    await setDoc(inviteRef, {
        fromUID,
        fromName,
        fromAvatar: fromAvatar || null,
        toUID,
        roomCode,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt
    });

    console.log(`[LOBBY-INVITES] Invito inviato: ${fromName} -> ${toUID} (room: ${roomCode})`);

    return inviteRef.id;
}

// QUERY INVITI

// Ottiene gli inviti pendenti per un utente (inviti ricevuti)
// Filtra automaticamente lato client quelli non scaduti confrontando expiresAt.toMillis() con Timestamp.now().toMillis().
export async function getPendingInvites(uid: string): Promise<LobbyInvite[]> {
    const invitesRef = collection(db, INVITES_COLLECTION);
    const now = Timestamp.now();

    const q = query(
        invitesRef,
        where('toUID', '==', uid),
        where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);

    // Filtra inviti non scaduti
    return snapshot.docs
        .map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LobbyInvite))
        .filter(invite => invite.expiresAt.toMillis() > now.toMillis());
}

// GESTIONE INVITI

// Accetta un invito lobby
// Verifica che lo status sia ancora pending, aggiorna a accepted, ritorna il roomCode per permettere la navigazione.
export async function acceptLobbyInvite(inviteId: string): Promise<string> {
    const docRef = doc(db, INVITES_COLLECTION, inviteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Invito non trovato');
    }

    const data = docSnap.data() as LobbyInvite;

    if (data.status !== 'pending') {
        throw new Error('Invito non più valido');
    }

    // Aggiorna lo stato
    await updateDoc(docRef, {
        status: 'accepted' as LobbyInviteStatus
    });

    console.log(`[LOBBY-INVITES] Invito accettato: ${inviteId}, roomCode: ${data.roomCode}`);

    return data.roomCode;
}

// Rifiuta un invito lobby
// Verifica che lo status sia ancora pending, aggiorna a rejected.
export async function rejectLobbyInvite(inviteId: string): Promise<void> {
    const docRef = doc(db, INVITES_COLLECTION, inviteId);

    await updateDoc(docRef, {
        status: 'rejected' as LobbyInviteStatus
    });

    console.log(`[LOBBY-INVITES] Invito rifiutato: ${inviteId}`);
}

// SOTTOSCRIZIONE REAL-TIME

// Sottoscrive agli inviti ricevuti in tempo reale
// Filtra automaticamente quelli scaduti
export function subscribeToLobbyInvites(
    uid: string,
    onUpdate: (invites: LobbyInvite[]) => void
): Unsubscribe {
    const invitesRef = collection(db, INVITES_COLLECTION);
    const q = query(
        invitesRef,
        where('toUID', '==', uid),
        where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
        const now = Timestamp.now();

        const invites = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LobbyInvite))
            .filter(invite => invite.expiresAt.toMillis() > now.toMillis());

        onUpdate(invites);
    }, (error) => {
        console.error('[LOBBY-INVITES] Errore sottoscrizione:', error);
    });
}
