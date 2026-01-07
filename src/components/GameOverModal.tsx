import React from 'react';
// import type { CluedoGameState } from '@cluedo-digital/shared';

interface GameOverModalProps {
  winnerName: string;
  solution: { suspectId: string; weaponId: string; roomId: string };
  isVictory: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winnerName, solution, isVictory }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full text-center border-4 border-slate-800">
        
        {/* TITOLO DINAMICO */}
        <h1 className={`text-4xl font-black mb-2 uppercase tracking-wider ${isVictory ? 'text-green-600' : 'text-red-600'}`}>
          {isVictory ? 'CASO RISOLTO!' : 'CASO IRRISOLTO'}
        </h1>

        <div className="text-xl mb-6 font-semibold text-slate-700">
          {isVictory ? 'Grande lavoro detective:' : 'Tutti i detective hanno fallito.'}
          <div className="text-2xl font-bold mt-1 text-black">
            {winnerName}
          </div>
        </div>

        {/* Qui sotto c'è la sezione che mostra la soluzione (le 3 carte), quella lasciala uguale */}
        {solution && (
            <div className="bg-slate-100 p-4 rounded-lg mb-6">
                <h3 className="text-sm uppercase font-bold text-slate-500 mb-2">La Soluzione Reale Era:</h3>
                <div className="flex justify-center gap-2">
                    {/* Qui potresti usare una funzione per tradurre gli ID in nomi leggibili */}
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">{solution.suspectId}</span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">{solution.weaponId}</span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">{solution.roomId}</span>
                </div>
            </div>
        )}

        <button 
          className="mt-8 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-full transition-all"
          onClick={() => window.location.reload()}
        >
          Nuova Partita
        </button>

      </div>
    </div>
  );
};