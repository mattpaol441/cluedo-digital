import React, { useState } from 'react';
import { SUSPECTS, WEAPONS, ROOMS } from "@cluedo-digital/shared"; 

interface HypothesisModalProps {
  currentRoomId: string; // La stanza arriva da fuori, non la decido io
  onSubmit: (suspect: string, weapon: string) => void;
}

export const HypothesisModal: React.FC<HypothesisModalProps> = ({ currentRoomId, onSubmit }) => {
  // STATO: Gestiamo solo Sospettato e Arma. La stanza non ha bisogno di stato, è fissa.
  const [selectedSuspect, setSelectedSuspect] = useState<string>(SUSPECTS[0].id);
  const [selectedWeapon, setSelectedWeapon] = useState<string>(WEAPONS[0].id);

  // Recuperiamo il nome della stanza (es. "kitchen" -> "Cucina")
  // Se non lo trova, usa l'ID grezzo come fallback
  const roomName = ROOMS.find(r => r.id === currentRoomId)?.name || currentRoomId;

  const handleSubmit = () => {
    // Passiamo al backend solo i due dati variabili.
    // Il backend sa già in che stanza siamo, ma per sicurezza lui userà player.currentRoom
    onSubmit(selectedSuspect, selectedWeapon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in pointer-events-none">
      
      {/* CARD PRINCIPALE: Usati bordi BLU per distinguerlo dall'Accusa (Rossa) */}
      <div className="bg-slate-800 border-2 border-blue-500 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden relative pointer-events-auto">
        
        {/* HEADER */}
        <div className="bg-blue-700 p-4 text-center shadow-md">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
            Formula Ipotesi
          </h2>
          <p className="text-blue-100 text-xs mt-1">Indaga su quanto accaduto qui</p>
        </div>

        {/* BODY DEL FORM */}
        <div className="p-6 space-y-6">
          
          {/* 1. CAMPO STANZA (SOLO LETTURA) */}
          <div className="opacity-90">
            <label className="block text-blue-400 text-xs font-bold uppercase mb-2">
              Luogo del Delitto (Qui)
            </label>
            {/* Questo div visualizza la stanza ma non permette di cambiarla */}
            <div className="w-full p-3 bg-slate-700 border border-blue-500/30 rounded text-white font-bold flex items-center gap-3 cursor-not-allowed">
               <span className="text-2xl">📍</span>
               <span className="uppercase tracking-wide text-lg">{roomName}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              *Puoi fare ipotesi solo nella stanza in cui ti trovi.
            </p>
          </div>

          {/* 2. SELETTORE SOSPETTATO */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              Chi è stato? (Sospettato)
            </label>
            <select 
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors appearance-none"
              value={selectedSuspect}
              onChange={(e) => setSelectedSuspect(e.target.value)}
            >
              {SUSPECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 3. SELETTORE ARMA */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              Con cosa? (Arma)
            </label>
            <select 
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors appearance-none"
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value)}
            >
              {WEAPONS.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* BOTTONE CONFERMA */}
          <button 
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] mt-2 uppercase tracking-widest border border-blue-400"
          >
            Conferma Ipotesi
          </button>
          
        </div>
      </div>
    </div>
  );
};