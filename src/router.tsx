// router.tsx: configurazione React Router con Data API
// Usa createBrowserRouter per:
// - URL come source of truth
// - Loaders per validazione e fetch dati
// - Gestione errori centralizzata
// - Back/forward browser funzionanti


import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
} from 'react-router-dom';

// Pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ProfileEditPage from './pages/ProfileEditPage';
import JoinGamePage from './pages/JoinGamePage';
import NewGame from './pages/NewGame';
import LobbyPage from './pages/LobbyPage';
import RootLayout from './components/RootLayout';
import ErrorPage from './components/ErrorPage';
import StatsPage from './pages/StatsPage';
import FriendsPage from './pages/FriendsPage';
import NotificationsPage from './pages/NotificationsPage';

// Services
import { getStoredCredentials, clearMatchCredentials } from './services/lobbyClient';
import lobbyClient from './services/lobbyClient';
import { getRoom } from './firebase/preLobby';


// LOADERS



// Loader per la pagina game: verifica credenziali e match attivo

export async function gameLoader({ params }: LoaderFunctionArgs) {
  const { matchId } = params;
  const credentials = getStoredCredentials();

  // Verifica credenziali
  if (!credentials) {
    console.log('[Router] Nessuna credenziale salvata, redirect a home');
    return redirect('/home');
  }

  // Verifica che il matchId corrisponda
  if (credentials.matchID !== matchId) {
    console.log('[Router] MatchID non corrisponde, redirect a home');
    return redirect('/home');
  }

  try {
    // Verifica che il match esista e sia attivo
    const match = await lobbyClient.getMatch(matchId!);

    if (match.gameover) {
      console.log('[Router] Match terminato, pulizia e redirect');
      clearMatchCredentials();
      return redirect('/home');
    }

    // Verifica che il nostro slot sia ancora nostro
    const ourSlot = match.players.find(
      p => p.id.toString() === credentials.playerID
    );

    if (!ourSlot || !ourSlot.name) {
      console.log('[Router] Slot non più nostro, pulizia e redirect');
      clearMatchCredentials();
      return redirect('/home');
    }

    // Tutto ok, ritorna i dati necessari
    return {
      matchID: credentials.matchID,
      playerID: credentials.playerID,
      credentials: credentials.playerCredentials,
      numPlayers: match.players.filter(p => p.name).length,
      match,
    };
  } catch (error) {
    console.log('[Router] Errore verifica match:', error);
    clearMatchCredentials();
    return redirect('/home');
  }
}

// Loader per la lobby: verifica room esistente
export async function lobbyLoader({ params }: LoaderFunctionArgs) {
  const { roomCode } = params;

  if (!roomCode) {
    return redirect('/home');
  }

  try {
    const room = await getRoom(roomCode);

    if (!room) {
      console.log('[Router] Room non trovata:', roomCode);
      return redirect('/home');
    }

    // Se la partita è già iniziata, redirect al game
    if (room.gameStarted && room.matchID) {
      return redirect(`/game/${room.matchID}`);
    }

    return { room, roomCode };
  } catch (error) {
    console.log('[Router] Errore verifica room:', error);
    return redirect('/home');
  }
}

// Loader per la root: gestisce redirect iniziale
export async function rootLoader() {
  // Controlla se ci sono credenziali di partita salvate
  const credentials = getStoredCredentials();

  if (credentials) {
    try {
      const match = await lobbyClient.getMatch(credentials.matchID);
      if (!match.gameover) {
        // Match attivo, redirect al game
        return redirect(`/game/${credentials.matchID}`);
      }
      // Match terminato, pulisci
      clearMatchCredentials();
    } catch {
      clearMatchCredentials();
    }
  }

  // Controlla se c'è una room in localStorage
  const roomCode = localStorage.getItem('cluedo_room_code');
  if (roomCode) {
    try {
      const room = await getRoom(roomCode);
      if (room && !room.gameStarted) {
        return redirect(`/lobby/${roomCode}`);
      }
      // Room non valida, pulisci
      localStorage.removeItem('cluedo_room_code');
      localStorage.removeItem('cluedo_room_is_host');
    } catch {
      localStorage.removeItem('cluedo_room_code');
      localStorage.removeItem('cluedo_room_is_host');
    }
  }

  return null;
}


// ROUTER CONFIGURATION


export const router = createBrowserRouter([
  {
    path: '/', // La radice ha come elemento il RootLayout. Tutte le route figlie (children) vengono renderizzate dentro l’<Outlet /> di RootLayout.
    element: <RootLayout />, // Il contenitore principale. Ogni volta che l’utente naviga in una pagina, React Router renderizza RootLayout come "contenitore" e la pagina specifica come figlia al suo interno.
    errorElement: <ErrorPage />,
    children: [ // I Figli
      {
        index: true,
        loader: rootLoader,
        element: <HomePage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'home',
        loader: rootLoader,
        element: <HomePage />,
      },
      {
        path: 'game/:matchId',
        loader: gameLoader,
        element: <GamePage />,
      },
      {
        path: 'game/local',
        element: <GamePage />,
      },
      {
        path: 'lobby/:roomCode',
        loader: lobbyLoader,
        element: <LobbyPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'join',
        element: <JoinGamePage />,
      },
      {
        path: 'new-game',
        element: <NewGame />,
      },
      {
        path: 'profile',
        element: <ProfileEditPage />,
      },
      {
        path: 'friends',
        element: <FriendsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
    ],
  },
]);

export default router;
