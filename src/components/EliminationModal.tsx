import React, { useState } from 'react';

export const EliminationModal: React.FC = () => {
  // Stato per gestire se il modale è "aperto" (grande) o "minimizzato" (piccolo)
  const [isDismissed, setIsDismissed] = useState(false);

  // --- MODALITÀ 1: STATUS BAR (Minimizzato) ---
  // Questo appare dopo che l'utente ha cliccato "Ho capito"
  if (isDismissed) {
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-red-950/90 border border-red-600 text-red-200 px-4 py-1 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse">
          <span> ! </span>
          <span>SEI ELIMINATO (SPETTATORE)</span>
        </div>
      </div>
    );
  }

  // --- MODALITÀ 2: MODALE DRAMMATICO (Iniziale) ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">

      {/* Card Centrale */}
      <div className="bg-slate-900 border-4 border-red-700 rounded-2xl shadow-[0_0_60px_-15px_rgba(220,38,38,0.6)] w-full max-w-lg p-8 text-center relative overflow-hidden">

        {/* Effetto bagliore sfondo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-75"></div>

        {/* Icona Gigante */}
        <div className="text-8xl mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-bounce">
          !
        </div>

        {/* Titolo */}
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-md">
          SEI STATO <span className="text-red-600">ELIMINATO</span>
        </h2>

        {/* Descrizione */}
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">

          Non puoi più muoverti o fare ipotesi, ma devi rimanere in partita per mostrare le carte agli altri investigatori.
        </p>

        {/* Bottone di Conferma (Dismiss) */}
        <button
          onClick={() => setIsDismissed(true)}
          className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg uppercase tracking-widest border border-red-500"
        >
          Accetto il mio destino
        </button>

      </div>
    </div>
  );
};