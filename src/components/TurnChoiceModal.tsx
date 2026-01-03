import React from 'react';
import { ROOMS } from '@cluedo-digital/shared'; 


interface TurnChoiceModalProps {
  currentRoomId: string;
  onChooseMove: () => void;
  onChooseHypothesis: () => void;
}

export const TurnChoiceModal: React.FC<TurnChoiceModalProps> = ({currentRoomId, onChooseMove, onChooseHypothesis }) => {
  const roomName = ROOMS.find(r => r.id === currentRoomId)?.name || currentRoomId;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 border-2 border-yellow-500/50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center">
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Sei stato portato in: <br/>
          <span className="text-yellow-400 uppercase text-3xl mt-2 block">{roomName}</span>
        </h2>
        <p className="text-slate-300 mb-8 text-sm">
          Un avversario ti ha trascinato in questa stanza per un'ipotesi.<br/>
          Ora è il tuo turno: cosa vuoi fare?
        </p>

        <div className="flex flex-col gap-4">
          {/* OPZIONE A: RESTA E INDAGA (Bonus) */}
          <button 
            onClick={onChooseHypothesis}
            className="group relative w-full py-4 bg-slate-700 hover:bg-blue-900 border border-slate-600 hover:border-blue-400 rounded-lg transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🔍</span>
              <div className="text-left">
                <div className="font-bold text-white uppercase group-hover:text-blue-100">Resta e Indaga</div>
                <div className="text-xs text-slate-400 group-hover:text-blue-200">Formula un'ipotesi senza muoverti</div>
              </div>
            </div>
          </button>

          <div className="text-slate-500 font-bold text-xs uppercase tracking-widest">- OPPURE -</div>

          {/* OPZIONE B: MUOVITI */}
          <button 
            onClick={onChooseMove}
            className="group relative w-full py-4 bg-slate-700 hover:bg-emerald-900 border border-slate-600 hover:border-emerald-400 rounded-lg transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎲</span>
              <div className="text-left">
                <div className="font-bold text-white uppercase group-hover:text-emerald-100">Esci dalla Stanza</div>
                <div className="text-xs text-slate-400 group-hover:text-emerald-200">Tira i dadi e spostati altrove</div>
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};