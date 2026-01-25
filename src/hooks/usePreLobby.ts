
// usePreLobby.ts: hook per gestire la pre-lobby con Firestore

// Gestisce la sala d'attesa PRIMA che venga creato il match BoardGame.io.
// Il match viene creato solo quando l'host avvia, con il numero esatto di giocatori.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  subscribeToRoom,
  signalGameStart,
  type PreLobbyRoom,
  type PreLobbyPlayer
} from '../firebase/preLobby';
import lobbyClient, {
  saveMatchCredentials,
  type MatchCredentials
} from '../services/lobbyClient';
import {
  setCreatingMatch,
  setCreateMatchError,
  setJoiningMatch,
  setJoinMatchError,
  setMatchCredentials,
  setConnectionStatus,
  leaveCurrentMatch,
} from '../store/slices/lobbySlice';

export interface UsePreLobbyState {
  room: PreLobbyRoom | null;
  isHost: boolean;
  roomCode: string | null;
  players: PreLobbyPlayer[];
  playerCount: number;
  canStartGame: boolean;
  isCreating: boolean;
  isJoining: boolean;
  isStarting: boolean;
  error: string | null;
}

// Chiave localStorage per persistere il room code tra navigazioni
const ROOM_CODE_KEY = 'cluedo_room_code';
const ROOM_IS_HOST_KEY = 'cluedo_room_is_host';

function saveRoomToStorage(code: string, isHost: boolean) {
  localStorage.setItem(ROOM_CODE_KEY, code);
  localStorage.setItem(ROOM_IS_HOST_KEY, isHost.toString());
}

function getRoomFromStorage(): { roomCode: string | null; isHost: boolean } {
  const roomCode = localStorage.getItem(ROOM_CODE_KEY);
  const isHost = localStorage.getItem(ROOM_IS_HOST_KEY) === 'true';
  return { roomCode, isHost };
}

function clearRoomStorage() {
  localStorage.removeItem(ROOM_CODE_KEY);
  localStorage.removeItem(ROOM_IS_HOST_KEY);
}

export function usePreLobby() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(state => state.user);

  // Recupera stato da localStorage se disponibile
  const stored = getRoomFromStorage();

  // Stato locale per la pre-lobby
  const [room, setRoom] = useState<PreLobbyRoom | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(stored.roomCode);
  const [isHost, setIsHost] = useState(stored.isHost);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null);

  // Ref per la sottoscrizione Firestore
  const unsubscribeRef = useRef<(() => void) | null>(null);


  // CREAZIONE ROOM


  const createNewRoom = useCallback(async (maxPlayers: number = 6) => {
    if (!user.uid || !user.displayName) {
      setError('Devi essere loggato per creare una partita');
      return null;
    }

    setIsCreating(true);
    setError(null);
    dispatch(setCreatingMatch(true));

    try {
      const code = await createRoom(
        user.uid,
        user.displayName,
        maxPlayers,
        user.avatarUrl || undefined
      );

      setRoomCode(code);
      setIsHost(true);
      setMyPlayerIndex(0);

      // Salva in localStorage per persistenza
      saveRoomToStorage(code, true);

      console.log(`[PRE-LOBBY] Room creata: ${code}`);

      // Naviga alla lobby
      navigate(`/lobby/${code}`);

      return code;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(message);
      dispatch(setCreateMatchError(message));
      return null;
    } finally {
      setIsCreating(false);
      dispatch(setCreatingMatch(false));
    }
  }, [user, navigate, dispatch]);


  // JOIN ROOM


  const joinExistingRoom = useCallback(async (code: string) => {
    if (!user.uid || !user.displayName) {
      setError('Devi essere loggato per unirti a una partita');
      return false;
    }

    setIsJoining(true);
    setError(null);
    dispatch(setJoiningMatch(true));

    try {
      const normalizedCode = code.toUpperCase().trim();
      const result = await joinRoom(
        normalizedCode,
        user.uid,
        user.displayName,
        user.avatarUrl || undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Errore join');
      }

      setRoomCode(normalizedCode);
      setIsHost(false);
      setMyPlayerIndex(result.playerIndex!);

      // Salva in localStorage per persistenza
      saveRoomToStorage(normalizedCode, false);

      console.log(`[PRE-LOBBY] Joined room ${code} come Player ${result.playerIndex}`);

      // Naviga alla lobby
      navigate(`/lobby/${normalizedCode}`);

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(message);
      dispatch(setJoinMatchError(message));
      return false;
    } finally {
      setIsJoining(false);
      dispatch(setJoiningMatch(false));
    }
  }, [user, navigate, dispatch]);


  // LEAVE ROOM


  const leaveCurrentRoom = useCallback(async () => {
    if (!roomCode || !user.uid) return;

    try {
      await leaveRoom(roomCode, user.uid);
    } catch (err) {
      console.warn('[PRE-LOBBY] Errore leave:', err);
    } finally {
      // Cleanup
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setRoom(null);
      setRoomCode(null);
      setIsHost(false);
      setMyPlayerIndex(null);
      clearRoomStorage(); // Pulisci localStorage
      dispatch(leaveCurrentMatch());
    }
  }, [roomCode, user.uid, dispatch]);


  // AVVIO PARTITA (SOLO HOST)


  const startGame = useCallback(async () => {
    if (!isHost || !room || !roomCode || !user.uid) {
      console.error('[PRE-LOBBY] Non puoi avviare la partita');
      return;
    }

    if (room.players.length < 3) {
      setError('Servono almeno 3 giocatori');
      return;
    }

    setIsStarting(true);
    setError(null);
    dispatch(setConnectionStatus('connecting'));

    try {
      const numPlayers = room.players.length;

      // 1. Crea il match BoardGame.io con il numero ESATTO di giocatori
      const { matchID } = await lobbyClient.createMatch(numPlayers, {
        // Questo oggetto è quello che Game.ts riceverà come "setupData"
        players: room.players.map(p => ({
          uid: p.uid, // Univoco per utente reale
          name: p.name,
          avatarUrl: p.avatarUrl
          // Non serve l'ID boardgame qui, perché l'ordine nell'array corrisponde già a 0, 1, 2...
        }))
      });

      console.log(`[PRE-LOBBY] Match BoardGame.io creato: ${matchID} con ${numPlayers} giocatori`);

      // 2. Fa join di tutti i giocatori al match
      const credentials: Record<string, string> = {};
      // Itera su tutti i giocatori salvati in Firestore
      for (const player of room.players) {
        // Chiama l'API del server per farli unire al match (lui incluso)
        const { playerCredentials } = await lobbyClient.joinMatch(
          matchID,
          player.index.toString(), // QUI avviene il binding: Index Firestore -> Boardgame PlayerID ("0", "1"...)
          player.name, // Il nome visualizzato
          // QUI passiamo i metadati che legano all'utente Firebase
          { firebaseUID: player.uid, avatarUrl: player.avatarUrl }
        );

        // Il server risponde con la password segreta (playerCredentials).
        // L'host la salva nella mappa associandola all'UID di quel giocatore.
        credentials[player.uid] = playerCredentials;
        console.log(`[PRE-LOBBY] Player ${player.index} (${player.name}) joined match`);
      }
      // Poiché BoardGame.io richiede un token segreto (credentials) per controllare un giocatore, e poiché 
      // é l'Host che ha registrato tutti (non i singoli client), l'Host deve distribuire questi token ai rispettivi proprietari.
      // Con questa, l'Host salva su Firestore un oggetto che mappa FirebaseUID -> Credenziali BoardGame.io. 
      // Gli altri client (che sono in ascolto su Firestore) vedono questo aggiornamento, cercano il proprio UID, prendono le credenziali associate e si connettono al server di gioco.
      await signalGameStart(roomCode, matchID, credentials);

      // 4. L'host naviga al gioco
      const myCredentials = credentials[user.uid];
      const myPlayerID = room.players.find(p => p.uid === user.uid)?.index.toString() || '0';

      // HOST + TUTTI: Salvano localmente le credenziali ricevute
      const matchCreds: MatchCredentials = {
        matchID,
        playerID: myPlayerID,
        playerCredentials: myCredentials
      };
      saveMatchCredentials(matchCreds);
      dispatch(setMatchCredentials(matchCreds));

      // Pulisci localStorage pre-lobby (la partita è iniziata)
      clearRoomStorage();

      // Naviga al gioco
      navigate(`/game/${matchID}`);

      console.log('[PRE-LOBBY] Partita avviata!');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore avvio partita';
      console.error('[PRE-LOBBY] Errore:', message);
      setError(message);
      dispatch(setConnectionStatus('disconnected'));
    } finally {
      setIsStarting(false);
    }
  }, [isHost, room, roomCode, user, navigate, dispatch]);


  // SOTTOSCRIZIONE REAL-TIME
  // Tutti i giocatori sono "in ascolto" (onSnapshot) su quel documento Firestore. 
  // Appena l'Host scrive lì, questa funzione scatta su tutti i computer dei giocatori.

  const subscribeToCurrentRoom = useCallback(() => {
    if (!roomCode) return;

    // Evita sottoscrizioni duplicate
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscribeToRoom(roomCode, (updatedRoom) => {
      if (!updatedRoom) {
        // Room eliminata (host uscito)
        console.log('[PRE-LOBBY] Room eliminata');
        setRoom(null);
        setRoomCode(null);
        clearRoomStorage();
        navigate('/home');
        return;
      }

      setRoom(updatedRoom);

      // Se la partita è iniziata e non sono l'host, naviga al gioco
      if (updatedRoom.gameStarted && !isHost && user.uid) {
        console.log('[PRE-LOBBY] Partita iniziata, navigazione al gioco...');

        // IL RITIRO DELLA CHIAVE
        // Guardo nella mappa 'playerCredentials' usando il MIO uid come chiave.
        // Se l'host ha fatto il suo lavoro, troverò la mia stringa segreta.        
        const myCredentials = updatedRoom.playerCredentials?.[user.uid];
        // Cerco anche qual è il mio numero di giocatore (0, 1, 2...)
        const myPlayer = updatedRoom.players.find(p => p.uid === user.uid);

        if (myCredentials && myPlayer && updatedRoom.matchID) {
          // SALVATAGGIO
          // Ho trovato la chiave. La salvo nel mio LocalStorage così non la perdo
          // nemmeno se ricarico la pagina.
          const matchCreds: MatchCredentials = {
            matchID: updatedRoom.matchID,
            playerID: myPlayer.index.toString(),
            playerCredentials: myCredentials // Questa è la password (chiave) segreta per me
          };
          saveMatchCredentials(matchCreds);
          dispatch(setMatchCredentials(matchCreds));

          // Cleanup sottoscrizione
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }

          // Pulisci localStorage pre-lobby
          clearRoomStorage();

          // CONNESSIONE
          // Ora ho tutto: ID partita, Mio ID ("1") e Password Segreta.
          // Posso andare alla pagina di gioco.
          navigate(`/game/${updatedRoom.matchID}`);
        }
      }
    });

    console.log(`[PRE-LOBBY] Sottoscritto a room ${roomCode}`);
  }, [roomCode, isHost, user.uid, navigate, dispatch]);

  // Avvia sottoscrizione quando abbiamo un roomCode
  useEffect(() => {
    if (roomCode) {
      subscribeToCurrentRoom();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [roomCode, subscribeToCurrentRoom]);


  // VALORI DERIVATI


  const players = room?.players || [];
  const playerCount = players.length;
  const canStartGame = isHost && playerCount >= 3;


  // RETURN


  return {
    // Stato
    room,
    roomCode,
    isHost,
    players,
    playerCount,
    canStartGame,
    myPlayerIndex,

    // Loading states
    isCreating,
    isJoining,
    isStarting,
    error,

    // Azioni
    createRoom: createNewRoom,
    joinRoom: joinExistingRoom,
    leaveRoom: leaveCurrentRoom,
    startGame,

    // Utils
    clearError: () => setError(null),
  };
}

export default usePreLobby;
