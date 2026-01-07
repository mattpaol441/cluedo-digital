import React from "react";
import type { CluedoGameState } from "@cluedo-digital/shared";

import { Dices } from "lucide-react";

interface DiceRollerProps {
    G: CluedoGameState;
    ctx: any;
    moves: any;
    playerID: string | null;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ G, ctx, moves, playerID }) => {
    const isMyTurn = ctx.currentPlayer === playerID;
    const hasRolled = G.diceRoll[0] !== 0 && G.diceRoll[1] !== 0;

    if (!isMyTurn) return null;
    if (hasRolled) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in border-4 border-slate-800">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">È il tuo turno!</h2>
                <p className="text-slate-500 mb-6">Devi tirare i dadi per muoverti.</p>

                <button
                onClick={() => moves.rollDice()}
                className="
                    group relative
                    bg-red-600 hover:bg-red-700 text-white 
                    font-bold text-xl py-4 px-10 rounded-full 
                    shadow-[0_4px_0_rgb(153,27,27)] hover:shadow-[0_2px_0_rgb(153,27,27)] hover:translate-y-[2px]
                    transition-all duration-150 flex items-center gap-3 mx-auto
                "
                >
                <Dices className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
                LANCIA I DADI
                </button>
            </div>

            </div>
    );
};

export default DiceRoller;