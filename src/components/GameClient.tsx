// GameClient: wrapper che inizializza il client boardgame.io
// e renderizza la GamePage con le props corrette
//
// Questo componente gestisce la connessione WebSocket al server di gioco
// utilizzando le credenziali ottenute dalla Lobby API.

import React, { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CluedoGame } from '../game/Game';
import GameBoard from '../game/GameBoard';

interface GameClientProps {
  matchID: string;
  playerID: string;
  credentials?: string;  // Credenziali dalla Lobby API per autenticazione
  numPlayers?: number;
}

const GameClient: React.FC<GameClientProps> = ({ 
  matchID, 
  playerID, 
  credentials,
  numPlayers = 3 
}) => {
  // Crea il client boardgame.io con la configurazione corretta
  // useMemo per evitare di ricreare il client ad ogni render
  const CluedoClient = useMemo(() => Client({
    game: CluedoGame,
    board: GameBoard,
    numPlayers: numPlayers,
    multiplayer: SocketIO({
      server: 'http://localhost:8000',
    }),
    debug: import.meta.env.DEV, // Debug solo in development
  }), [numPlayers]);

  // Renderizza il client con matchID, playerID e credentials
  // Le credentials sono necessarie per autenticarsi al server
  return (
    <CluedoClient 
      matchID={matchID} 
      playerID={playerID} 
      credentials={credentials}
    />
  );
};

export default GameClient;
