// Firebase Friends Service Layer
// Funzioni per gestire le amicizie in Firestore
// Come per gli altri file, anche questo funge da "ponte" tra l'applicazione e Firestore. 
// Ogni funzione è stateless: prende input, fa operazioni su Firestore, ritorna output.
// Gestisce le amicizie confermate e la ricerca utenti.
// Usato principalmente da friendSlice.ts e friendRequests.ts per creare l'amicizia quando una richiesta viene accettata.

import {
    doc,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Friendship, FriendProfile } from '../types';
import { createFriendshipId, sortUserIds } from '../types/friends';
import type { UserProfile } from '../types/user';

const FRIENDSHIPS_COLLECTION = 'friendships';
const USERS_COLLECTION = 'users';

// QUERY AMICIZIE

// Query Firestore sulla collection friendships con array-contains per trovare tutte le amicizie dove l'utente appare.
export async function getFriendships(uid: string): Promise<Friendship[]> {
    const friendshipsRef = collection(db, FRIENDSHIPS_COLLECTION);
    const q = query(
        friendshipsRef,
        where('users', 'array-contains', uid)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Friendship));
}

// Chiama getFriendships, poi per ogni amicizia estrae l'UID dell'altro utente e carica il suo profilo dalla collection users. 
// Ritorna un array di FriendProfile.
export async function getFriendProfiles(uid: string): Promise<FriendProfile[]> {
    const friendships = await getFriendships(uid);

    // Estrai gli UID degli amici
    const friendUIDs = friendships.map(f => {
        return f.users[0] === uid ? f.users[1] : f.users[0];
    });

    if (friendUIDs.length === 0) return [];

    // Carica i profili degli amici
    const profiles: FriendProfile[] = [];

    for (const friendUID of friendUIDs) {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, friendUID));
        if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            profiles.push({
                uid: friendUID,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                isOnline: (data as any).isOnline || false // Campo che aggiungeremo
            });
        }
    }

    return profiles;
}

// Verifica se due utenti sono amici: genera l'ID amicizia deterministico (come definito in /types/friends.ts) e fa getDoc per verificare se esiste.
export async function areFriends(uid1: string, uid2: string): Promise<boolean> {
    const friendshipId = createFriendshipId(uid1, uid2);
    const docRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

// CREAZIONE/RIMOZIONE AMICIZIE

// Crea una nuova amicizia tra due utenti, procucendo il documento amicizia con gli UID degli utenti e la data di creazione.
// Chiamata quando una richiesta viene accettata: lo fa usando le funzioni createFriendshipId e sortUserIds (definiti in /types/friends.ts)
export async function createFriendship(uid1: string, uid2: string): Promise<void> {
    const friendshipId = createFriendshipId(uid1, uid2);
    const sortedUsers = sortUserIds(uid1, uid2);

    const docRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
    await setDoc(docRef, {
        users: sortedUsers,
        createdAt: serverTimestamp()
    });

    console.log(`[FRIENDS] Amicizia creata: ${uid1} <-> ${uid2}`);
}

// Rimuove un'amicizia: genera l'ID amicizia deterministico (come definito in /types/friends.ts) e fa deleteDoc per rimuovere il documento.
export async function removeFriendship(uid1: string, uid2: string): Promise<void> {
    const friendshipId = createFriendshipId(uid1, uid2);
    const docRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
    await deleteDoc(docRef);

    console.log(`[FRIENDS] Amicizia rimossa: ${uid1} <-> ${uid2}`);
}

// RICERCA UTENTI

// Cerca utenti per displayName
// Ricerca case-insensitive con prefisso
export async function searchUsersByName(
    searchQuery: string,
    currentUserUID: string,
    maxResults: number = 10
): Promise<UserProfile[]> {
    if (!searchQuery.trim()) return [];

    // Firestore non supporta ricerca full-text, quindi usiamo un range query
    // Questo trova utenti il cui displayName inizia con la query
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(
        usersRef,
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff'),
        limit(maxResults + 1) // +1 per escludere l'utente corrente
    );

    const snapshot = await getDocs(q);

    return snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(user => user.uid !== currentUserUID); // Escludi te stesso
}


// Ottiene il profilo di un singolo utente
export async function getUserProfileById(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}
