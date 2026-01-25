// Firebase Friend Requests Service Layer
// Gestione intero ciclo di vita delle richieste di amicizia
// Usato principalmente da friendSlice.ts e useFriendRequests.ts per la sottoscrizione real-time.

import {
    doc,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { FriendRequest, FriendRequestStatus } from '../types';
import { createFriendship } from './friends';

const REQUESTS_COLLECTION = 'friendRequests';

// INVIO RICHIESTE

// Invia una richiesta di amicizia, ma prima verifica se esiste già una richiesta pending tra questi utenti. 
// Se non esiste, crea una nuova richiesta, ovvero un documento in Firestore FriendRequests.
export async function sendFriendRequest(
    fromUID: string,
    fromName: string,
    fromAvatar: string | undefined,
    toUID: string
): Promise<string> {
    // Verifica se esiste già una richiesta pending tra questi utenti
    const existing = await getExistingRequest(fromUID, toUID);
    if (existing) {
        throw new Error('Richiesta già inviata o amicizia già esistente');
    }

    const requestRef = doc(collection(db, REQUESTS_COLLECTION));

    await setDoc(requestRef, {
        fromUID,
        fromName,
        fromAvatar: fromAvatar || null,
        toUID,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    console.log(`[FRIEND-REQUESTS] Richiesta inviata: ${fromName} -> ${toUID}`);

    return requestRef.id;
}

// Verifica se esiste già una richiesta tra due utenti (controlla richieste duplicate).
async function getExistingRequest(
    uid1: string,
    uid2: string
): Promise<FriendRequest | null> {
    const requestsRef = collection(db, REQUESTS_COLLECTION);

    // Cerca richieste in entrambe le direzioni
    const q1 = query(
        requestsRef,
        where('fromUID', '==', uid1),
        where('toUID', '==', uid2),
        where('status', '==', 'pending')
    );

    const q2 = query(
        requestsRef,
        where('fromUID', '==', uid2),
        where('toUID', '==', uid1),
        where('status', '==', 'pending')
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    if (!snap1.empty) {
        return { id: snap1.docs[0].id, ...snap1.docs[0].data() } as FriendRequest;
    }
    if (!snap2.empty) {
        return { id: snap2.docs[0].id, ...snap2.docs[0].data() } as FriendRequest;
    }

    return null;
}

// QUERY RICHIESTE

// Ottiene le richieste ricevute (con stato pending)
export async function getPendingRequests(uid: string): Promise<FriendRequest[]> {
    const requestsRef = collection(db, REQUESTS_COLLECTION);
    const q = query(
        requestsRef,
        where('toUID', '==', uid),
        where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FriendRequest));
}


// Ottiene le richieste inviate (con stato pending)
export async function getSentRequests(uid: string): Promise<FriendRequest[]> {
    const requestsRef = collection(db, REQUESTS_COLLECTION);
    const q = query(
        requestsRef,
        where('fromUID', '==', uid),
        where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FriendRequest));
}

// GESTIONE RICHIESTE

// Legge il documento, aggiorna status a accepted, poi chiama createFriendship() dal servizio firebase/friends.ts per creare l'amicizia vera e propria.
export async function acceptFriendRequest(requestId: string): Promise<void> {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Richiesta non trovata');
    }

    const request = docSnap.data() as FriendRequest;

    if (request.status !== 'pending') {
        throw new Error('Richiesta già gestita');
    }

    // Aggiorna lo stato della richiesta
    await updateDoc(docRef, {
        status: 'accepted' as FriendRequestStatus,
        updatedAt: serverTimestamp()
    });

    // Crea l'amicizia
    await createFriendship(request.fromUID, request.toUID);

    console.log(`[FRIEND-REQUESTS] Richiesta accettata: ${requestId}`);
}

// Rifiuta una richiesta di amicizia aggiornando lo stato a rejected.
export async function rejectFriendRequest(requestId: string): Promise<void> {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('Richiesta non trovata');
    }

    // Aggiorna lo stato della richiesta (opzionale: potremmo anche eliminarla)
    await updateDoc(docRef, {
        status: 'rejected' as FriendRequestStatus,
        updatedAt: serverTimestamp()
    });

    console.log(`[FRIEND-REQUESTS] Richiesta rifiutata: ${requestId}`);
}

// Annulla una richiesta inviata eliminando il documento.
export async function cancelFriendRequest(requestId: string): Promise<void> {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    await deleteDoc(docRef);

    console.log(`[FRIEND-REQUESTS] Richiesta annullata: ${requestId}`);
}

// SOTTOSCRIZIONE REAL-TIME


// Sottoscrive alle richieste ricevute in tempo reale
// Crea una sottoscrizione real-time (onSnapshot) alle richieste pending. 
// Ogni volta che Firestore notifica un cambiamento, chiama onUpdate con la nuova lista.

export function subscribeToFriendRequests(
    uid: string,
    onUpdate: (requests: FriendRequest[]) => void
): Unsubscribe {
    const requestsRef = collection(db, REQUESTS_COLLECTION);
    const q = query(
        requestsRef,
        where('toUID', '==', uid),
        where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FriendRequest));

        onUpdate(requests);
    }, (error) => {
        console.error('[FRIEND-REQUESTS] Errore sottoscrizione:', error);
    });
}
