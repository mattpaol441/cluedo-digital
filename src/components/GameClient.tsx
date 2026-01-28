// GameClient: wrapper che inizializza il client boardgame.io
// e renderizza la GamePage con le props corrette
//
// Questo componente gestisce la connessione WebSocket al server di gioco
// utilizzando le credenziali ottenute dalla Lobby API.

import React, { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO, Local } from 'boardgame.io/multiplayer';
import { RandomBot } from 'boardgame.io/ai';
import { CluedoGame } from '../game/Game';
import GameBoard from '../game/GameBoard';

import { SmartBot } from '../game/utils/SmartBot';

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

  // Check se la partita è in locale
  const isLocal = matchID === 'local';

  const CluedoClient = useMemo(() => {
    let bots: Record<string, any> | undefined = undefined;

    if (isLocal) {
      // Aggiungi bot per i giocatori non umani in locale

      // Definiamo il Bot configurato
      const ConfiguredSmartBot = class extends SmartBot {
        constructor(inputs: any) {
          super({
            ...inputs,
            delay: 1500, // 1.5 secondi di ragionamento
          });
        }
      };

      bots = {};
      for (let i = 1; i < numPlayers; i++) {
        bots[String(i)] = ConfiguredSmartBot;
      }
    }

    return Client({
      game: CluedoGame,
      board: GameBoard,
      numPlayers: numPlayers,
      multiplayer: isLocal ? Local({bots: bots}) : SocketIO({
        server: 'http://localhost:8000',
      }),
      debug: import.meta.env.DEV, // Debug solo in development
    });

  }, [numPlayers, isLocal]);

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
