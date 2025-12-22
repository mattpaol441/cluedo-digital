// mette insieme le Regole con la Grafica e li connette al Server
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CluedoGame } from './game/Game';
import { CluedoBoard } from './game/BoardTry';

// Configurazione del Client di Gioco
const CluedoClient = Client({
  game: CluedoGame,      // 1. Le Regole (Backend Logic)
  board: CluedoBoard,    // 2. La Grafica (Frontend UI)
  
  // 3. Il Canale di Comunicazione (Multiplayer)
 multiplayer: SocketIO({
  server: '/', 
}),
  
  debug: true, // Abilita il pannello di debug laterale (utile in sviluppo)
});

function App() {
  // solo per vedere che il multiplayer funziona
  // In futuro questo verrà gestito dalla Lobby e dall'Auth
  const playerID = new URLSearchParams(window.location.search).get('id') || "0";

  return (
    <div className="h-full w-full">
      {/* Avviamo il client come Giocatore "0" */}
      <CluedoClient playerID={playerID} />
    </div>
  );
}

export default App;