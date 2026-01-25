
// // Gestisce i segnali di stato della partita tramite Firestore
// // Usato per sincronizzare l'avvio del gioco tra tutti i client

// import { 
//   doc, 
//   setDoc, 
//   getDoc, 
//   deleteDoc, 
//   onSnapshot,
//   type Unsubscribe 
// } from 'firebase/firestore';
// import { db } from './config';

// const COLLECTION_NAME = 'matchSignals';

// export interface MatchSignal {
//   matchID: string;
//   gameStarted: boolean;
//   startedAt: number;
//   hostPlayerID: string;
//   numPlayers: number;
// }


// // Segnala che la partita è stata avviata dall'host
// export async function signalGameStarted(
//   matchID: string, 
//   hostPlayerID: string,
//   numPlayers: number
// ): Promise<void> {
//   const docRef = doc(db, COLLECTION_NAME, matchID);
//   await setDoc(docRef, {
//     matchID,
//     gameStarted: true,
//     startedAt: Date.now(),
//     hostPlayerID,
//     numPlayers
//   } satisfies MatchSignal);
//   console.log(`[MATCH-SIGNAL] Partita ${matchID} segnalata come avviata`);
// }


// // Controlla se la partita è stata avviata

// export async function checkGameStarted(matchID: string): Promise<MatchSignal | null> {
//   const docRef = doc(db, COLLECTION_NAME, matchID);
//   const docSnap = await getDoc(docRef);
  
//   if (docSnap.exists()) {
//     return docSnap.data() as MatchSignal;
//   }
//   return null;
// }

// // Sottoscrive ai cambiamenti del segnale di partita
// // Restituisce una funzione per annullare la sottoscrizione
// export function subscribeToGameSignal(
//   matchID: string,
//   onSignal: (signal: MatchSignal | null) => void
// ): Unsubscribe {
//   const docRef = doc(db, COLLECTION_NAME, matchID);
  
//   return onSnapshot(docRef, (docSnap) => {
//     if (docSnap.exists()) {
//       onSignal(docSnap.data() as MatchSignal);
//     } else {
//       onSignal(null);
//     }
//   }, (error) => {
//     console.error('[MATCH-SIGNAL] Errore nella sottoscrizione:', error);
//     onSignal(null);
//   });
// }


// // Rimuove il segnale di partita (cleanup)
// export async function removeGameSignal(matchID: string): Promise<void> {
//   const docRef = doc(db, COLLECTION_NAME, matchID);
//   await deleteDoc(docRef);
//   console.log(`[MATCH-SIGNAL] Segnale per ${matchID} rimosso`);
// }
