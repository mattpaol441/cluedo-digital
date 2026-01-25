// Tipi relativi all'utente e autenticazione

// Questi sono tipi per l'App State (Redux/Firebase).
// I tipi di gioco (Card, Player, etc.) sono in @cluedo-digital/shared


// Profilo utente salvato su Firestore 
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt?: unknown; // serverTimestamp() type
  lastLoginAt?: unknown;
  stats: UserStats;
}

// Statistiche di gioco dell'utente 
export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
}

// Dati utente base ritornati da Firebase Auth 
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Per la cronologia delle partite dell'utente
export interface MatchHistoryEntry {
  id: string;           // ID del match
  date: number;         // Timestamp
  result: 'WIN' | 'LOSS';
  character: string;    // Chi eri? (es. "mustard")
  winner: string;       // Chi ha vinto? (Nome del vincitore)
}