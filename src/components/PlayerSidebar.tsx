import React from "react";
import type { Player } from "@cluedo-digital/shared";
import ProfileView from "./ProfileView";
import { getCharacterAvatar } from "../utils/assets";

interface PlayerSidebarProps {
  players: Player[];
  currentPlayerId: string; // Player ID for current turn (to highlight)
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({
  players,
  currentPlayerId,
}) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700 h-full flex flex-col gap-4">
      <h3 className="text-white font-bold text-lg border-b border-slate-600 pb-2 mb-2">
        Giocatori
      </h3>
      
      <div className="flex flex-col gap-6 overflow-y-auto">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
             <ProfileView 
               name={p.name} // Show nickname
               imageUrl={getCharacterAvatar(p.character)} // Show character avatar
               isActive={p.id === currentPlayerId} // Glow if it's their turn
               size="small"
             />
             
             {/* Extra info */}
             <div className="text-slate-400 text-xs">
                {p.id === currentPlayerId && <span className="text-yellow-400">Turno in corso...</span>}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerSidebar;