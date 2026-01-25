// /**
//  * useLobby.ts - Hook per gestire tutte le operazioni della Lobby
//  * 
//  * Questo hook fornisce:
//  * - Creazione di nuovi match
//  * - Join a match esistenti
//  * - Leave da un match
//  * - Polling automatico dello stato della lobby
//  * - Gestione credenziali e persistenza
//  * - Sincronizzazione avvio partita tramite Firebase
//  */

// import { useCallback, useEffect, useRef } from 'react';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import lobbyClient, { 
//   saveMatchCredentials, 
//   clearMatchCredentials as clearStoredCredentials,
//   getStoredCredentials,
//   type MatchCredentials 
// } from '../services/lobbyClient';
// import {
//   setCreatingMatch,
//   setCreateMatchError,
//   setJoiningMatch,
//   setJoinMatchError,
//   setCurrentMatch,
//   updateCurrentMatch,
//   setMatchCredentials,
//   setLeavingMatch,
//   leaveCurrentMatch,
//   setPollingLobby,
//   setConnectionStatus,
// } from '../store/slices/lobbySlice';
// import { useNavigate } from 'react-router-dom';
// import { 
//   signalGameStarted, 
//   subscribeToGameSignal, 
//   type MatchSignal 
// } from '../firebase/matchSignal';

// // Intervallo di polling in ms (ogni 2 secondi)
// const POLLING_INTERVAL = 2000;

// /**
//  * @deprecated Usa usePreLobby invece per il sistema pre-lobby con Firestore
//  */
// export function useLobby() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
  
//   // Selettori dallo store
//   const user = useAppSelector(state => state.user);
//   const lobby = useAppSelector(state => state.lobby);
  
//   // Ref per il polling interval
//   const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
//   // Ref per la sottoscrizione Firebase al segnale di avvio partita
//   const gameSignalUnsubRef = useRef<(() => void) | null>(null);

//   // ============================================
//   // CREAZIONE MATCH
//   // ============================================
  
//   /**
//    * Crea un nuovo match e diventa l'host
//    * @param numPlayers - Numero massimo di giocatori (3-6)
//    */
//   const createMatch = useCallback(async (numPlayers: number = 6) => {
//     if (!user.uid || !user.displayName) {
//       dispatch(setCreateMatchError('Devi essere loggato per creare una partita'));
//       return null;
//     }

//     dispatch(setCreatingMatch(true));

//     try {
//       // 1. Crea il match sul server
//       const { matchID } = await lobbyClient.createMatch(numPlayers, {
//         hostUID: user.uid,
//         hostName: user.displayName
//       });

//       console.log(`[LOBBY] Match creato: ${matchID}`);

//       // 2. Fai join automatico come primo giocatore (host)
//       const { playerCredentials } = await lobbyClient.joinMatch(
//         matchID,
//         '0', // L'host è sempre il player 0
//         user.displayName,
//         { firebaseUID: user.uid, avatarUrl: user.avatarUrl || undefined }
//       );

//       // 3. Salva le credenziali
//       const credentials: MatchCredentials = {
//         matchID,
//         playerID: '0',
//         playerCredentials
//       };
      
//       saveMatchCredentials(credentials);
//       dispatch(setMatchCredentials(credentials));

//       // 4. Recupera i dettagli del match
//       const matchDetails = await lobbyClient.getMatch(matchID);
      
//       dispatch(setCurrentMatch({ 
//         match: matchDetails, 
//         isHost: true 
//       }));

//       console.log(`[LOBBY] Join come host completato`);

//       // 5. Naviga alla lobby
//       navigate(`/lobby/${matchID}`);

//       return matchID;

//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Errore sconosciuto';
//       console.error('[LOBBY] Errore creazione match:', message);
//       dispatch(setCreateMatchError(message));
//       return null;
//     }
//   }, [dispatch, user, navigate]);

//   // ============================================
//   // JOIN MATCH
//   // ============================================
  
//   /**
//    * Unisciti a un match esistente tramite codice
//    * @param matchCode - Codice/ID del match (6 caratteri o ID completo)
//    */
//   const joinMatch = useCallback(async (matchCode: string) => {
//     if (!user.uid || !user.displayName) {
//       dispatch(setJoinMatchError('Devi essere loggato per unirti a una partita'));
//       return false;
//     }

//     dispatch(setJoiningMatch(true));

//     try {
//       // Usa l'ID così com'è (BoardGame.io IDs sono case-sensitive)
//       const matchID = matchCode.trim();

//       // 2. Verifica che il match esista e trova uno slot libero
//       const match = await lobbyClient.getMatch(matchID);
      
//       if (match.gameover) {
//         throw new Error('Questa partita è già terminata');
//       }

//       // 3. Trova il primo slot disponibile
//       const availableSlot = await lobbyClient.findAvailableSlot(matchID);
      
//       if (!availableSlot) {
//         throw new Error('La partita è piena, non ci sono posti disponibili');
//       }

//       // 4. Controlla se l'host siamo noi (verifica dal setupData)
//       const isHost = match.setupData?.hostUID === user.uid;

//       // 5. Fai join
//       const { playerCredentials } = await lobbyClient.joinMatch(
//         matchID,
//         availableSlot,
//         user.displayName,
//         { firebaseUID: user.uid, avatarUrl: user.avatarUrl || undefined }
//       );

//       // 6. Salva le credenziali
//       const credentials: MatchCredentials = {
//         matchID,
//         playerID: availableSlot,
//         playerCredentials
//       };
      
//       saveMatchCredentials(credentials);
//       dispatch(setMatchCredentials(credentials));

//       // 7. Aggiorna lo stato con i dettagli del match
//       const updatedMatch = await lobbyClient.getMatch(matchID);
      
//       dispatch(setCurrentMatch({ 
//         match: updatedMatch, 
//         isHost 
//       }));

//       console.log(`[LOBBY] Join completato come Player ${availableSlot}`);

//       // 8. Naviga alla lobby
//       navigate(`/lobby/${matchID}`);

//       return true;

//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Errore sconosciuto';
//       console.error('[LOBBY] Errore join match:', message);
//       dispatch(setJoinMatchError(message));
//       return false;
//     }
//   }, [dispatch, user, navigate]);

//   // ============================================
//   // LEAVE MATCH
//   // ============================================
  
//   /**
//    * Lascia il match corrente
//    */
//   const leaveMatch = useCallback(async () => {
//     const { matchCredentials, currentMatch } = lobby;
    
//     if (!matchCredentials || !currentMatch) {
//       dispatch(leaveCurrentMatch());
//       return;
//     }

//     dispatch(setLeavingMatch(true));

//     try {
//       await lobbyClient.leaveMatch(
//         matchCredentials.matchID,
//         matchCredentials.playerID,
//         matchCredentials.playerCredentials
//       );

//       console.log('[LOBBY] Leave completato');

//     } catch (error) {
//       // Ignora errori di leave (potrebbe essere già uscito)
//       console.warn('[LOBBY] Errore leave (ignorato):', error);
//     } finally {
//       // Pulisci sempre lo stato locale
//       clearStoredCredentials();
//       dispatch(leaveCurrentMatch());
//       stopPolling();
//     }
//   }, [dispatch, lobby]);

//   // ============================================
//   // POLLING STATO LOBBY
//   // ============================================
  
//   /**
//    * Ferma il polling e le sottoscrizioni
//    */
//   const stopPolling = useCallback(() => {
//     if (pollingRef.current) {
//       clearInterval(pollingRef.current);
//       pollingRef.current = null;
//       console.log('[LOBBY] Polling fermato');
//     }
    
//     if (gameSignalUnsubRef.current) {
//       gameSignalUnsubRef.current();
//       gameSignalUnsubRef.current = null;
//       console.log('[LOBBY] Sottoscrizione segnale avvio fermata');
//     }
    
//     dispatch(setPollingLobby(false));
//   }, [dispatch]);

//   /**
//    * Avvia il polling per aggiornare lo stato della lobby
//    */
//   const startPolling = useCallback(() => {
//     if (pollingRef.current) return; // Già in polling
    
//     const { matchCredentials } = lobby;
//     if (!matchCredentials) return;

//     dispatch(setPollingLobby(true));

//     // Polling per aggiornare la lista dei giocatori
//     pollingRef.current = setInterval(async () => {
//       try {
//         const match = await lobbyClient.getMatch(matchCredentials.matchID);
//         dispatch(updateCurrentMatch(match));
//       } catch (error) {
//         console.error('[LOBBY] Errore polling:', error);
//         // Se il match non esiste più, ferma il polling
//         if (error instanceof Error && error.message.includes('non trovato')) {
//           stopPolling();
//           dispatch(leaveCurrentMatch());
//         }
//       }
//     }, POLLING_INTERVAL);

//     // Sottoscrizione real-time al segnale di avvio partita (solo per non-host)
//     if (!lobby.isHost) {
//       gameSignalUnsubRef.current = subscribeToGameSignal(
//         matchCredentials.matchID,
//         (signal: MatchSignal | null) => {
//           if (signal?.gameStarted) {
//             console.log('[LOBBY] Segnale ricevuto: partita avviata dall\'host!');
//             stopPolling();
//             dispatch(setConnectionStatus('connecting'));
            
//             // Naviga al gioco
//             navigate(`/game/${matchCredentials.matchID}`);
//           }
//         }
//       );
//       console.log('[LOBBY] Sottoscrizione al segnale di avvio attivata');
//     }

//     console.log('[LOBBY] Polling avviato');
//   }, [dispatch, lobby.matchCredentials, lobby.isHost, navigate, stopPolling]);

//   // ============================================
//   // AVVIO PARTITA
//   // ============================================
  
//   /**
//    * Avvia la partita (solo host)
//    * Invia segnale Firebase agli altri client e naviga alla GamePage
//    */
//   const startGame = useCallback(async () => {
//     const { matchCredentials, currentMatch, isHost } = lobby;
    
//     if (!matchCredentials || !currentMatch) {
//       console.error('[LOBBY] Nessun match attivo');
//       return;
//     }

//     if (!isHost) {
//       console.error('[LOBBY] Solo l\'host può avviare la partita');
//       return;
//     }

//     // Conta i giocatori che hanno fatto join
//     const joinedPlayers = currentMatch.players.filter(p => p.name !== undefined);
    
//     if (joinedPlayers.length < 3) {
//       console.error('[LOBBY] Servono almeno 3 giocatori');
//       return;
//     }

//     // Ferma il polling prima di andare al gioco
//     stopPolling();
    
//     // Imposta lo stato come "connecting"
//     dispatch(setConnectionStatus('connecting'));

//     // Numero effettivo di giocatori che hanno fatto join
//     const actualPlayerCount = joinedPlayers.length;

//     try {
//       // Invia il segnale Firebase per notificare gli altri client
//       await signalGameStarted(
//         matchCredentials.matchID,
//         matchCredentials.playerID,
//         actualPlayerCount
//       );
//       console.log(`[LOBBY] Segnale di avvio inviato (${actualPlayerCount} giocatori)`);
//     } catch (error) {
//       console.error('[LOBBY] Errore invio segnale (continuo comunque):', error);
//     }

//     // Naviga al gioco
//     navigate(`/game/${matchCredentials.matchID}`);

//     console.log('[LOBBY] Partita avviata!');
//   }, [dispatch, lobby, navigate, stopPolling]);

//   // ============================================
//   // RICONNESSIONE
//   // ============================================
  
//   /**
//    * Tenta di riconnettersi a un match precedente
//    */
//   const tryReconnect = useCallback(async () => {
//     const stored = getStoredCredentials();
//     if (!stored) return false;

//     try {
//       const match = await lobbyClient.getMatch(stored.matchID);
      
//       // Verifica che il nostro slot sia ancora occupato da noi
//       const ourSlot = match.players.find(
//         p => p.id.toString() === stored.playerID
//       );
      
//       if (!ourSlot || !ourSlot.name) {
//         // Slot non più nostro, pulisci
//         clearStoredCredentials();
//         return false;
//       }

//       // Riconnessione valida
//       dispatch(setMatchCredentials(stored));
//       dispatch(setCurrentMatch({ 
//         match, 
//         isHost: match.setupData?.hostUID === user.uid 
//       }));

//       console.log('[LOBBY] Riconnessione riuscita');
//       return true;

//     } catch (error) {
//       console.warn('[LOBBY] Riconnessione fallita:', error);
//       clearStoredCredentials();
//       return false;
//     }
//   }, [dispatch, user.uid]);

//   // ============================================
//   // CLEANUP
//   // ============================================
  
//   useEffect(() => {
//     // Cleanup al unmount
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//       }
//       if (gameSignalUnsubRef.current) {
//         gameSignalUnsubRef.current();
//       }
//     };
//   }, []);

//   // ============================================
//   // RETURN
//   // ============================================
  
//   return {
//     // Stato
//     ...lobby,
//     user,
    
//     // Azioni
//     createMatch,
//     joinMatch,
//     leaveMatch,
//     startGame,
    
//     // Polling
//     startPolling,
//     stopPolling,
    
//     // Riconnessione
//     tryReconnect,
    
//     // Computed
//     matchCode: lobby.currentMatch?.matchID || null,
//     joinedPlayersCount: lobby.currentMatch?.players.filter(p => p.name !== undefined).length || 0,
//     canStartGame: lobby.isHost && 
//       (lobby.currentMatch?.players.filter(p => p.name !== undefined).length || 0) >= 3,
//   };
// }

// export default useLobby;
