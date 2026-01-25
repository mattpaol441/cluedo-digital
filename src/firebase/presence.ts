// Firebase Presence Service Layer
// Gestione/tracciamento stato online/offline degli utenti
// Usato principalmente da useFriends.ts per ricevere gli aggiornamenti di presenza degli amici e da usePresence.ts per impostare il proprio stato online.
// Questo servizio NON crea una nuova collection. Scrive direttamente nel documento utente esistente (users/{uid}), aggiungendo i campi isOnline e lastSeen.

// SISTEMA HEARTBEAT:
// - L'utente invia un "heartbeat" ogni HEARTBEAT_INTERVAL_MS (5 minuti) aggiornando lastSeen
// - Un utente è considerato "online" se lastSeen è più recente di PRESENCE_TIMEOUT_MS (10 minuti)
// - Il timeout è 2x l'intervallo heartbeat per tollerare ritardi di rete

import {
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

const USERS_COLLECTION = 'users';

// Costanti per il sistema heartbeat
export const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minuti - frequenza di aggiornamento lastSeen
export const PRESENCE_TIMEOUT_MS = 10 * 60 * 1000;  // 10 minuti - soglia per considerare un utente offline


// GESTIONE PRESENZA


// Aggiorna il timestamp lastSeen dell'utente (chiamata dal heartbeat)
// Questo è il "battito cardiaco" che indica che l'utente è ancora attivo
export async function updateUserPresence(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        lastSeen: serverTimestamp()
    });

    console.log(`[PRESENCE] Heartbeat utente ${uid}`);
}

// Imposta l'utente come online (chiamata all'avvio)
// Manteniamo anche isOnline per retrocompatibilità, ma il sistema usa lastSeen per determinare lo stato
export async function setUserOnline(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp()
    });

    console.log(`[PRESENCE] Utente ${uid} online`);
}

// Imposta l'utente come offline (chiamata al logout/chiusura)
// Nota: questo potrebbe non essere sempre chiamato (es. crash browser), ma il sistema
// heartbeat garantisce che l'utente verrà comunque mostrato offline dopo PRESENCE_TIMEOUT_MS
export async function setUserOffline(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp()
    });

    console.log(`[PRESENCE] Utente ${uid} offline`);
}

// Funzione helper per determinare se un utente è online
// Controlla DUE condizioni:
// 1. isOnline === true (per gestire logout esplicito - se false, è offline immediatamente)
// 2. lastSeen è recente (per gestire chiusura browser/crash - timeout dopo 10 min)
function checkUserOnline(isOnlineFlag: boolean | undefined, lastSeen: Timestamp | null | undefined): boolean {
    // Se isOnline è esplicitamente false (logout), l'utente è offline
    if (isOnlineFlag === false) return false;

    // Se non c'è lastSeen, non possiamo determinare lo stato
    if (!lastSeen) return false;

    // Controlla se lastSeen è abbastanza recente
    const lastSeenMs = lastSeen.toMillis();
    const now = Date.now();
    const timeSinceLastSeen = now - lastSeenMs;

    return timeSinceLastSeen < PRESENCE_TIMEOUT_MS;
}

// SOTTOSCRIZIONE A PRESENZA AMICI

// Sottoscrive allo stato di presenza di un singolo utente, invocando onUpdate ogni volta che cambia lo stato.
// NUOVO: Calcola isOnline basandosi su lastSeen invece di leggere il campo isOnline
export function subscribeToUserPresence(
    uid: string,
    onUpdate: (isOnline: boolean) => void
): Unsubscribe {
    const userRef = doc(db, USERS_COLLECTION, uid);

    return onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            // Controlla sia isOnline (logout esplicito) che lastSeen (timeout)
            const isOnline = checkUserOnline(data.isOnline, data.lastSeen as Timestamp | null);
            onUpdate(isOnline);
        }
    }, (error) => {
        console.error('[PRESENCE] Errore sottoscrizione:', error);
    });
}

// Sottoscrive allo stato di presenza di più utenti
// Crea N sottoscrizioni (una per amico) e mantiene una mappa {uid: isOnline}. 
// Ogni volta che uno stato cambia, chiama onUpdate con la mappa aggiornata. 
// Ritorna una funzione di cleanup che annulla tutte le sottoscrizioni.
//
// IMPORTANTE: Include un timer periodico che ri-valuta lo stato online ogni minuto.
// Questo è necessario perché se un utente smette di inviare heartbeat, il suo lastSeen
// non cambia e Firestore non invia notifiche. Il timer garantisce che dopo il timeout
// l'utente venga correttamente mostrato offline.
export function subscribeToMultiplePresence(
    uids: string[],
    onUpdate: (presenceMap: Record<string, boolean>) => void
): Unsubscribe {
    if (uids.length === 0) {
        onUpdate({});
        return () => { };
    }

    const presenceMap: Record<string, boolean> = {};
    // Manteniamo i dati per il ricalcolo periodico
    const lastSeenMap: Record<string, Timestamp | null> = {};
    const isOnlineFlagMap: Record<string, boolean | undefined> = {};
    const unsubscribes: Unsubscribe[] = [];

    for (const uid of uids) {
        const userRef = doc(db, USERS_COLLECTION, uid);

        const unsub = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                const lastSeen = data.lastSeen as Timestamp | null;
                const isOnlineFlag = data.isOnline as boolean | undefined;

                lastSeenMap[uid] = lastSeen;
                isOnlineFlagMap[uid] = isOnlineFlag;

                const isOnline = checkUserOnline(isOnlineFlag, lastSeen);
                presenceMap[uid] = isOnline;
                onUpdate({ ...presenceMap });
            }
        }, (error) => {
            console.error('[PRESENCE] Errore sottoscrizione:', error);
        });

        unsubscribes.push(unsub);
    }

    // Timer periodico per ri-valutare lo stato online
    // Necessario perché se un utente smette di inviare heartbeat, il suo documento
    // non viene aggiornato e Firestore non invia notifiche
    const reevaluateInterval = setInterval(() => {
        let changed = false;

        for (const uid of uids) {
            const lastSeen = lastSeenMap[uid];
            const isOnlineFlag = isOnlineFlagMap[uid];
            const wasOnline = presenceMap[uid];
            const isNowOnline = checkUserOnline(isOnlineFlag, lastSeen);

            if (wasOnline !== isNowOnline) {
                presenceMap[uid] = isNowOnline;
                changed = true;
            }
        }

        // Notifica solo se c'è stato un cambiamento
        if (changed) {
            console.log('[PRESENCE] Ri-valutazione periodica: stato aggiornato');
            onUpdate({ ...presenceMap });
        }
    }, 60 * 1000); // Ri-valuta ogni minuto

    // Ritorna una funzione che annulla tutte le sottoscrizioni e il timer
    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearInterval(reevaluateInterval);
    };
}
