// server.ts è un vero server Node.js che dice a Node.js "prendi gli attrezzi di BoardGame.io, calaci sopra le mie regole di Cluedo e avvia tutto sulla porta 8000".
// Riceve le mosse dei giocatori via internet (Socket.io).
// Esegue le regole del gioco definite in Game.ts sul server, così nessuno può barare.
// Tiene sincronizzati tutti i giocatori: se uno muove una pedina, tutti vedono il cambiamento.
// server.ts lavora come l’arbitro centrale di una partita Multiplayer online

// NOTA: dove gira realmente la logica del gioco (le regole) e si tiene lo stato del gioco?
// In un gioco multiplayer online come questo la logica del gioco e lo stato del gioco devono essere gestiti sul server per garantire l'integrità e la sicurezza del gioco.
// Questo impedisce ai giocatori di barare o manipolare lo stato del gioco, poiché tutte le decisioni critiche vengono prese dal server.
// In questo modo, il server agisce come l'autorità centrale che mantiene lo stato del gioco coerente e affidabile per tutti i partecipanti.
// In single-player o local multiplayer (più giocatori sullo stesso computer), la logica e lo stato del gioco possono essere gestiti localmente sul client (browser).
// Reso possibile poiché Game.ts contiene solo matematica e logica pura, senza dipendenze da browser o Node.js, quindi può essere eseguito ovunque.  

// NOTA BENE: Puntiamo esplicitamente alla versione CJS per evitare errori di importazione ESM e per garantire la stabilità su Node 22
// @ts-expect-error - boardgame.io non fornisce tipi per l'import CJS diretto, ma funziona a runtime
import { Server, Origins } from 'boardgame.io/dist/cjs/server.js'; // Così accediamo a una "macchina" gigantesca che è nascosta dentro la libreria boardgame.io che avvia un server web (basato su un framework chiamato Koa), attiva Socket.io aprendo i canali di comunicazione automaticamente, e 
// crea di default uno spazio nella RAM per salvare lo stato (G) di tutte le partite attive
import { CluedoGame } from './game/Game';

const server = Server({
  // Carichiamo le regole definite sopra e le passiamo al server come fossero il suo libretto di istruzioni (altrimenti non saprebbe come si gioca)
  games: [CluedoGame],

  // Per sicurezza nello sviluppo, accettiamo connessioni solo dal computer locale
  origins: [Origins.LOCALHOST],
});

// Avviamo il server sulla porta 8000
const PORT = 8000;
server.run(PORT, () => {
  console.log(`Game Server attivo su http://localhost:${PORT}`);
});