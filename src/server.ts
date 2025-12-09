// dica a Node.js "prendi gli attrezzi di BoardGame.io, calaci sopra le mie regole di Cluedo e avvia tutto sulla porta 8000".
// NOTA BENE: Puntiamo esplicitamente alla versione CJS per evitare errori di importazione ESM e per garantire la stabilità su Node 22
import { Server, Origins } from 'boardgame.io/dist/cjs/server.js'; 
import { CluedoGame } from './game/Game';

const server = Server({
  // Carichiamo le regole definite sopra
  games: [CluedoGame],

  // Sicurezza: Accettiamo connessioni solo dal computer locale
  origins: [Origins.LOCALHOST],
});

// Avviamo il server sulla porta 8000
const PORT = 8000;
server.run(PORT, () => {
  console.log(`✅ Game Server attivo su http://localhost:${PORT}`);
});