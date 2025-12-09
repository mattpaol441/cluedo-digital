// definisce la Grafica: fa solo vedere quello che gli dice il cervello e segnala i click.
import type { BoardProps } from 'boardgame.io/react';
import type { CluedoGameState } from './Game';

// Definiamo le props specificando il nostro tipo di stato
interface Props extends BoardProps<CluedoGameState> {}

export function CluedoBoard({ G, moves, ctx }: Props) {
  // Stile base per la griglia (usiamo Tailwind!)
  const cellStyle = "border-2 border-gray-700 h-24 w-24 flex items-center justify-center text-4xl cursor-pointer hover:bg-gray-800 transition-colors";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white gap-8">
      <h1 className="text-3xl font-bold text-yellow-500">
        Cluedo Digital - Turno di Giocatore {ctx.currentPlayer}
      </h1>

      {/* Griglia 3x3 Temporanea */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-slate-800 rounded-xl shadow-2xl">
        {G.cells.map((cell, id) => (
          <div
            key={id}
            className={cellStyle}
            onClick={() => moves.clickCell(id)} // Chiama la mossa definita nel server
          >
            {/* Se la cella è occupata, mostra l'ID del giocatore, altrimenti nulla */}
            {cell !== null ? <span className="text-red-500 font-bold">{cell}</span> : ''}
          </div>
        ))}
      </div>

      <div className="text-gray-400 text-sm">
        Apri un'altra finestra browser per testare il multiplayer!
      </div>
    </div>
  );
}