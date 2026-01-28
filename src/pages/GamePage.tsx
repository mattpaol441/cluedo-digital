import { useLoaderData, useParams } from 'react-router-dom';
import GameClient from '../components/GameClient';

interface GameLoaderData {
  matchID: string;
  playerID: string;
  credentials: string;
  numPlayers: number;
}


// Route wrapper per la pagina di gioco.
// Ottiene i dati dal loader (credenziali, matchID) e li passa a GameClient.

export default function GamePage() {
  const { matchId } = useParams<{ matchId: string }>();
  const loaderData = useLoaderData() as GameLoaderData | null;

  // Modalità locale (nessun loader data)
  if (!matchId || matchId === 'local') {
    return (
      <GameClient
        matchID="local"
        playerID="0"
        credentials=""
        numPlayers={2}
      />
    );
  }

  // Partita multiplayer: usa i dati dal loader
  if (!loaderData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Errore</h1>
          <p className="text-gray-400 mb-4">
            Impossibile caricare i dati della partita.
          </p>
          <a
            href="/home"
            className="text-blue-400 hover:underline"
          >
            Torna alla home
          </a>
        </div>
      </div>
    );
  }

  return (
    <GameClient
      matchID={loaderData.matchID}
      playerID={loaderData.playerID}
      credentials={loaderData.credentials}
      numPlayers={loaderData.numPlayers}
    />
  );
}
