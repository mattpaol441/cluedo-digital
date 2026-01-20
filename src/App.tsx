// questo è il componente principale dell'applicazione React, il direttore d'orchestra da cui parte tutto
// qui si collega il gioco di Boardgame.io (le regole) con la UI (la grafica) di React e il server multiplayer 
// inoltre qui si mette il Notification Manager che legge da Redux e mostra le notifiche a schermo
// quando React renderizza App, costruisce l’intera interfaccia utente (tutte le pagine, le componenti ecc....).

// NOTA: In un'applicazione ben fatta, App viene renderizzata:
// una volta all'avvio (Mount): quando si apre il sito si costruisce lo scheletro
// raramente durante l'uso: solo se cambiano cose "globali" che riguardano tutto il sito
// cercando di far scattare l'aggiornamento il più in basso possibile e di evitare di mettere stati locali in App che cambiano spesso, perché farebbero
// rifare tutta l'interfaccia utente (re-render) inutilmente causando cali di prestazioni.

import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CluedoGame } from './game/Game';
import GamePage from './pages/GamePage';
import { NotificationManager } from './components/NotificationManager';
import HomePage from './pages/HomePage';
import NewGame from './pages/NewGame';
import ProfileEditPage from './pages/ProfileEditPage';
import JoinGamePage from './pages/JoinGamePage';

// Configurazione del Client di Gioco (di Boardgame.io) chiamato da App
const CluedoClient = Client({
  game: CluedoGame,      // 1. Le Regole (Backend Logic)
  board: GamePage,    // 2. La Grafica (Frontend UI)
  numPlayers: 3,
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

      {/* Notification Manager: legge Redux, mostra toast */}
      {/* <NotificationManager /> */}

      {/* Avviamo il client come Giocatore "0" */}
      {/* <CluedoClient playerID={playerID} /> */}
      {/* <HomePage /> */}
      {/*<NewGame />*/}
      {/*<ProfileEditPage />*/}
      <JoinGamePage />
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