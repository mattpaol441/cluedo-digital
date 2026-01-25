// Firebase User Service Layer

// Funzioni pure per interagire con Firebase Auth e Firestore.
// NON è un Repository pattern, sono solo helper per organizzazione del codice.

// NOTA: Tutte le funzioni propagano gli errori (no try/catch interno).
// La gestione errori è centralizzata nei Thunk con translateFirebaseError.


import { // "Attrezzi" per l'autenticazione
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail as firebaseUpdateEmail,
  verifyBeforeUpdateEmail, // Per inviare mail di verifica
  updateProfile as updateAuthProfile, // Rinominato per ricordarci che aggiorna il profilo del "buttafuori" (Auth), non quello del database.
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { // "Attrezzi" per il Database (firestore)
  doc, collection, addDoc, query, orderBy, limit, getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./config"; // Le istanze "accese" che abbiamo creato nel file config.ts
import type { UserProfile, AuthUser, MatchHistoryEntry } from "../types";








// FUNZIONI DI AUTH

// Funzione per aggiornare l'email di autenticazione
export const updateUserLoginEmail = async (newEmail: string): Promise<void> => {
  const user = auth.currentUser;

  if (!user) throw new Error("Nessun utente loggato");
  if (user.email === newEmail) return; // Nessun cambiamento

  // Questo aggiorna l'email di login su Firebase Auth
  await firebaseUpdateEmail(user, newEmail);
};

// Registra un nuovo utente con email e password 
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Aggiorna displayName su Firebase Auth
  await updateAuthProfile(userCredential.user, { displayName }); // Chiaramente parte solo dopo che il primo await é stato risolto

  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: displayName
  };
};

// Login con email e password 
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName
  };
};

// Logout 
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Observer per stato autenticazione (usato in App.tsx)
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};








// FUNZIONI FIRESTORE (Profilo) 



// Funzione per salvare una partita nella storia
export const saveMatchToHistory = async (
  uid: string,
  entry: Omit<MatchHistoryEntry, 'id'>
) => {
  // Creiamo una sotto-collezione 'history' dentro il documento dell'utente
  const historyRef = collection(db, "users", uid, "history");
  await addDoc(historyRef, entry);
};

// Funzione per leggere le ultime 5 partite
export const getUserHistory = async (uid: string): Promise<MatchHistoryEntry[]> => {
  const historyRef = collection(db, "users", uid, "history");
  const q = query(historyRef, orderBy("date", "desc"), limit(5));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MatchHistoryEntry));
};

// Crea profilo utente su Firestore (dopo registrazione) 
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string
): Promise<void> => {
  const userRef = doc(db, "users", uid);

  const newProfile: UserProfile = {
    uid,
    email,
    displayName,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0
    }
  };

  await setDoc(userRef, newProfile);
};

// Legge profilo utente da Firestore 
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }
  return null;
};

// Aggiorna profilo utente su Firestore 
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...updates,
    lastLoginAt: serverTimestamp()
  });
};

// Aggiorna statistiche dopo una partita 
export const updateUserStats = async (
  uid: string,
  won: boolean
): Promise<void> => {
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const currentStats = profile.stats;
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    stats: {
      gamesPlayed: currentStats.gamesPlayed + 1,
      wins: currentStats.wins + (won ? 1 : 0),
      losses: currentStats.losses + (won ? 0 : 1)
    }
  });
};
