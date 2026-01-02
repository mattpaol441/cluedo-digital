import React from 'react';
// import type { CluedoGameState } from '@cluedo-digital/shared';

interface GameOverModalProps {
  winnerName: string;
  solution?: { suspectId: string; weaponId: string; roomId: string };
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winnerName, solution }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in text-white">
        <h1 className="text-6xl font-black text-yellow-400 mb-4 tracking-tighter drop-shadow-lg">
            CASO RISOLTO!
        </h1>
        
        <div className="bg-slate-900 p-8 rounded-2xl border-2 border-yellow-500 shadow-2xl text-center max-w-lg">
            <p className="text-xl mb-6">
                Il vincitore è: <br/>
                <span className="text-3xl font-bold text-yellow-300">
                    {winnerName}
                </span>
            </p>

            {solution && (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <p className="text-xs uppercase text-slate-400 font-bold mb-2">La Soluzione Reale:</p>
                    <div className="flex justify-center gap-2">
                         {/* Qui potresti usare una funzione per tradurre gli ID in nomi leggibili */}
                        <span className="bg-red-600 px-2 py-1 rounded text-sm font-bold">{solution.suspectId}</span>
                        <span className="bg-blue-600 px-2 py-1 rounded text-sm font-bold">{solution.weaponId}</span>
                        <span className="bg-green-600 px-2 py-1 rounded text-sm font-bold">{solution.roomId}</span>
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