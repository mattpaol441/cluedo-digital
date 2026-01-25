// lobbyClient.ts: Client per la Lobby API di BoardGame.io
 
// Questo modulo fornisce un'interfaccia semplice per comunicare con il server
// BoardGame.io e gestire la creazione, join e gestione dei match.
 
// Funzionalità:
// - Creazione di nuovi match
// - Join/Leave da un match
// - Lista dei match disponibili
// - Recupero dettagli di un singolo match
// - Aggiornamento metadati giocatore (nome, dati custom)

// Configurazione del server
const LOBBY_SERVER_URL = 'http://localhost:8000';
const GAME_NAME = 'cluedo-digital';


// TIPI



// Metadati di un giocatore all'interno di un match

export interface LobbyPlayer {
  id: number;           // PlayerID numerico (0, 1, 2...)
  name?: string;        // Nome visualizzato
  isConnected?: boolean;
  data?: {              // Dati custom (per associare a Firebase User)
    firebaseUID?: string;
    avatarUrl?: string;
  };
}


// Rappresenta un match nella lista

export interface LobbyMatch {
  matchID: string;
  gameName: string;
  players: LobbyPlayer[];
  createdAt: number;
  updatedAt: number;
  gameover?: boolean;
  setupData?: {
    hostUID?: string;
    hostName?: string;
    maxPlayers?: number;
  };
}


// Risposta alla creazione di un match
export interface CreateMatchResponse {
  matchID: string;
}

// Risposta al join di un match
export interface JoinMatchResponse {
  playerCredentials: string;
}

// Risposta alla lista dei match
export interface ListMatchesResponse {
  matches: LobbyMatch[];
}

// Risposta ai dettagli di un match
export interface GetMatchResponse extends LobbyMatch {}

// Credenziali salvate localmente per riconnettersi
export interface MatchCredentials {
  matchID: string;
  playerID: string;
  playerCredentials: string;
}


// LOBBY CLIENT


export const lobbyClient = {
  
  // Crea un nuovo match
  // numPlayers: Numero di giocatori (min 3, max 6 per Cluedo)
  // setupData: Dati opzionali per il setup (es. chi è l'host)
  // returns L'ID del match creato
  async createMatch(
    numPlayers: number, 
    setupData?: any
  ): Promise<CreateMatchResponse> {
    const response = await fetch(`${LOBBY_SERVER_URL}/games/${GAME_NAME}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        numPlayers,
        setupData 
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore creazione match: ${error}`);
    }

    return response.json();
  },

  
   // Unisciti a un match esistente
   // matchID: ID del match
   // playerID: ID del posto da occupare (0, 1, 2...)
   // playerName: Nome da mostrare agli altri giocatori
   // data: Dati custom (es. Firebase UID per statistiche)
   // returns Le credenziali per connettersi al gioco
  
  async joinMatch(
    matchID: string,
    playerID: string,
    playerName: string,
    data?: { firebaseUID?: string; avatarUrl?: string }
  ): Promise<JoinMatchResponse> {
    const response = await fetch(`${LOBBY_SERVER_URL}/games/${GAME_NAME}/${matchID}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerID,
        playerName,
        data
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore join match: ${error}`);
    }

    return response.json();
  },

  
  // Lascia un match
  // matchID: ID del match
  // playerID: Il tuo playerID
  // credentials: Le tue credenziali
  
  async leaveMatch(
    matchID: string,
    playerID: string,
    credentials: string
  ): Promise<void> {
    const response = await fetch(`${LOBBY_SERVER_URL}/games/${GAME_NAME}/${matchID}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerID,
        credentials
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore leave match: ${error}`);
    }
  },

  
  // Ottieni la lista di tutti i match disponibili
  // isGameover: Filtra per match terminati/attivi
  // returns Lista dei match
  async listMatches(isGameover?: boolean): Promise<ListMatchesResponse> {
    let url = `${LOBBY_SERVER_URL}/games/${GAME_NAME}`;
    
    if (isGameover !== undefined) {
      url += `?isGameover=${isGameover}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore lista match: ${error}`);
    }

    return response.json();
  },


  // Ottieni i dettagli di un singolo match
  // matchID: ID del match
  // returns Dettagli del match inclusi i giocatori
  async getMatch(matchID: string): Promise<GetMatchResponse> {
    const response = await fetch(`${LOBBY_SERVER_URL}/games/${GAME_NAME}/${matchID}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Match non trovato. Verifica il codice e riprova.');
      }
      const error = await response.text();
      throw new Error(`Errore recupero match: ${error}`);
    }

    return response.json();
  },

  
  // Aggiorna i metadati di un giocatore (nome, avatar, ecc.)
  // matchID: ID del match
  // playerID: Il tuo playerID
  // credentials: Le tue credenziali
  // newName: Nuovo nome (opzionale)
  // data: Nuovi dati custom (opzionale)
  async updatePlayer(
    matchID: string,
    playerID: string,
    credentials: string,
    newName?: string,
    data?: { firebaseUID?: string; avatarUrl?: string }
  ): Promise<void> {
    const response = await fetch(`${LOBBY_SERVER_URL}/games/${GAME_NAME}/${matchID}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerID,
        credentials,
        newName,
        data
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore aggiornamento giocatore: ${error}`);
    }
  },

  

   // Crea un nuovo match per giocare di nuovo con gli stessi giocatori
   // matchID: ID del match precedente
   // playerID: Il tuo playerID
   // credentials: Le tue credenziali
   // returns ID del nuovo match
  
  async playAgain(
    matchID: string,
    playerID: string,
    credentials: string
  ): Promise<{ nextMatchID: string }> {
    const response = await fetch(`${LOBBY_SERVER_URL}/games/${GAME_NAME}/${matchID}/playAgain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerID,
        credentials
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore play again: ${error}`);
    }

    return response.json();
  },

  

   // Trova il primo slot disponibile in un match
   // matchID: ID del match
   // returns Il playerID del primo slot libero, o null se pieno
  
  async findAvailableSlot(matchID: string): Promise<string | null> {
    const match = await this.getMatch(matchID);
    
    for (const player of match.players) {
      // Uno slot è libero se non ha un nome associato
      if (!player.name) {
        return player.id.toString();
      }
    }
    
    return null;
  },

  

   // Verifica se un match è pronto per iniziare (tutti gli slot occupati o minimo raggiunto)
   // matchID: ID del match
   // minPlayers: Numero minimo di giocatori (default 3)
   // returns true se il match può iniziare
  
  async isMatchReady(matchID: string, minPlayers: number = 3): Promise<boolean> {
    const match = await this.getMatch(matchID);
    
    const connectedPlayers = match.players.filter(p => p.name !== undefined);
    return connectedPlayers.length >= minPlayers;
  }
};


// STORAGE LOCALE PER CREDENZIALI


const CREDENTIALS_KEY = 'cluedo_match_credentials';


// Salva le credenziali in localStorage per permettere riconnessione
  
export function saveMatchCredentials(credentials: MatchCredentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}


// Recupera le credenziali salvate
  
export function getStoredCredentials(): MatchCredentials | null {
  const stored = localStorage.getItem(CREDENTIALS_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}


// Rimuove le credenziali salvate

export function clearMatchCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
}

export default lobbyClient;
