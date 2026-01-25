// preLobby.ts: gestisce la lobby pre-partita usando Firestore
// Questo servizio gestisce la "sala d'attesa" PRIMA che il match BoardGame.io venga creato.
// Il match vero viene creato solo quando l'host avvia la partita, con il numero esatto di giocatori.
 
// Flusso:
// 1. Host crea una "room" in Firestore (non un match BoardGame.io)
// 2. Altri giocatori joinano la room
// 3. Quando l'host avvia, si crea il match BoardGame.io con N giocatori esatti
// 4. Tutti i giocatori ricevono le credenziali e si connettono


import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Unsubscribe,
  type Timestamp
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'preLobbyRooms';

// Rappresenta un giocatore nella pre-lobby
export interface PreLobbyPlayer {
  index: number;           // Indice assegnato (0 = host, 1, 2, ...)
  uid: string;             // Firebase UID
  name: string;            // Display name
  avatarUrl?: string;      // Avatar opzionale
  joinedAt: number;        // Timestamp di join
}


// Rappresenta una room nella pre-lobby

export interface PreLobbyRoom {
  roomCode: string;        // Codice univoco della room
  hostUID: string;         // Firebase UID dell'host
  hostName: string;        // Nome dell'host
  maxPlayers: number;      // Numero massimo di giocatori (impostato dall'host)
  players: PreLobbyPlayer[]; // Lista giocatori che hanno joinato
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  
  // Quando l'host avvia, questi campi vengono popolati
  gameStarted: boolean;
  matchID?: string;        // ID del match BoardGame.io creato
  playerCredentials?: Record<string, string>; // UID -> credentials
}


// Genera un codice room casuale di 6 caratteri
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Escludo caratteri ambigui
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}


// Crea una nuova room (chiamato dall'host)
export async function createRoom(
  hostUID: string,
  hostName: string,
  maxPlayers: number,
  hostAvatarUrl?: string
): Promise<string> {
  const roomCode = generateRoomCode();
  
  const room: Omit<PreLobbyRoom, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>, updatedAt: ReturnType<typeof serverTimestamp> } = {
    roomCode,
    hostUID,
    hostName,
    maxPlayers,
    players: [{
      index: 0,
      uid: hostUID,
      name: hostName,
      avatarUrl: hostAvatarUrl,
      joinedAt: Date.now()
    }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    gameStarted: false
  };
  
  await setDoc(doc(db, COLLECTION_NAME, roomCode), room);
  console.log(`[PRE-LOBBY] Room creata: ${roomCode}`);
  
  return roomCode;
}


// Recupera una room
export async function getRoom(roomCode: string): Promise<PreLobbyRoom | null> {
  const docRef = doc(db, COLLECTION_NAME, roomCode);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as PreLobbyRoom;
  }
  return null;
}

// Join a una room esistente
export async function joinRoom(
  roomCode: string,
  playerUID: string,
  playerName: string,
  avatarUrl?: string
): Promise<{ success: boolean; error?: string; playerIndex?: number }> {
  const room = await getRoom(roomCode);
  
  if (!room) {
    return { success: false, error: 'Room non trovata' };
  }
  
  if (room.gameStarted) {
    return { success: false, error: 'La partita è già iniziata' };
  }
  
  // Controlla se già presente
  const existingPlayer = room.players.find(p => p.uid === playerUID);
  if (existingPlayer) {
    return { success: true, playerIndex: existingPlayer.index };
  }
  
  if (room.players.length >= room.maxPlayers) {
    return { success: false, error: 'La room è piena' };
  }
  
  const playerIndex = room.players.length;
  const newPlayer: PreLobbyPlayer = {
    index: playerIndex,
    uid: playerUID,
    name: playerName,
    avatarUrl,
    joinedAt: Date.now()
  };
  
  const docRef = doc(db, COLLECTION_NAME, roomCode);
  await updateDoc(docRef, {
    players: arrayUnion(newPlayer),
    updatedAt: serverTimestamp()
  });
  
  console.log(`[PRE-LOBBY] ${playerName} joined room ${roomCode} come Player ${playerIndex}`);
  
  return { success: true, playerIndex };
}

// Lascia una room
export async function leaveRoom(
  roomCode: string,
  playerUID: string
): Promise<void> {
  const room = await getRoom(roomCode);
  if (!room) return;
  
  const player = room.players.find(p => p.uid === playerUID);
  if (!player) return;
  
  // Se è l'host che esce, elimina la room
  if (player.index === 0) {
    await deleteRoom(roomCode);
    return;
  }
  
  const docRef = doc(db, COLLECTION_NAME, roomCode);
  await updateDoc(docRef, {
    players: arrayRemove(player),
    updatedAt: serverTimestamp()
  });
  
  console.log(`[PRE-LOBBY] Player ${playerUID} left room ${roomCode}`);
}

// Elimina una room
export async function deleteRoom(roomCode: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, roomCode);
  await deleteDoc(docRef);
  console.log(`[PRE-LOBBY] Room ${roomCode} eliminata`);
}

// Sottoscrive ai cambiamenti della room (real-time)
export function subscribeToRoom(
  roomCode: string,
  onUpdate: (room: PreLobbyRoom | null) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, roomCode);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as PreLobbyRoom);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    console.error('[PRE-LOBBY] Errore sottoscrizione:', error);
    onUpdate(null);
  });
}

// Segnala che la partita è stata avviata e salva i dati del match
// Chiamato dall'host dopo aver creato il match BoardGame.io
export async function signalGameStart(
  roomCode: string,
  matchID: string,
  playerCredentials: Record<string, string> // L'Host salva su Firestore un oggetto che mappa FirebaseUID -> Credenziali BoardGame.io.
): Promise<void> {
  // Qui scrive/salva nel documento della stanza
  const docRef = doc(db, COLLECTION_NAME, roomCode);
  await updateDoc(docRef, {
    gameStarted: true, // "La partita è iniziata"
    matchID, // "Questo é l'ID della partita BoardGame.io"
    playerCredentials, // "Queste sono le credenziali per ogni giocatore per entrare"
    updatedAt: serverTimestamp()
  });
  
  console.log(`[PRE-LOBBY] Partita avviata per room ${roomCode}, matchID: ${matchID}`);
}
