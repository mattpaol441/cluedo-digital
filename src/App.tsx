// mette insieme le Regole con la Grafica e li connette al Server
// mette insieme le Regole con la Grafica e li connette al Server
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CluedoGame } from './game/Game';
import GamePage from './pages/GamePage';

// Configurazione del Client di Gioco
const CluedoClient = Client({
  game: CluedoGame,      // 1. Le Regole (Backend Logic)
  board: GamePage,    // 2. La Grafica (Frontend UI)
  numPlayers: 2,
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





// // TEST per vedere il taccuino 

// import { Notebook } from './components/Notebook';
// import type { Card } from "@cluedo-digital/shared";

// // --- DATI FALSI PER IL TEST ---
// const FINTA_MANO: Card[] = [
//   { id: 'dagger', name: 'Pugnale', type: 'WEAPON' },
//   { id: 'kitchen', name: 'Cucina', type: 'ROOM' },
// ];

// const FINTE_CARTE_TAVOLO: Card[] = [
//   { id: 'hall', name: 'Ingresso', type: 'ROOM' },
// ];

// function App() {
//   return (
//     <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-8">
      
//       <h1 className="text-white text-2xl font-bold mb-6">Test Taccuino</h1>
      
//       {/* Contenitore Sidebar */}
//       <div className="w-[350px] h-[600px] shadow-2xl rounded-xl overflow-hidden border-4 border-slate-600 bg-white">
        
//         <Notebook 
//           myHand={FINTA_MANO} 
//           tableCards={FINTE_CARTE_TAVOLO}
//           matchID="test-match-001"
//           myPlayerID="0" // Fingo di essere il Giocatore 0
// />
        
//       </div>

//     </div>
//   );
// }

// export default App;