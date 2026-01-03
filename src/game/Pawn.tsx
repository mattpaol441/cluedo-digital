import React from "react";


interface PawnProps {
    id: string;      // chracter ID (es. "scarlet", "mustard", ecc.)
    color: string; // Pawn Color (es. "#FF0000" for red
    isCurrentTurn?: boolean; // if is the current player's turn (highlight the pawn)
}

const Pawn: React.FC<PawnProps> = ({ id, color, isCurrentTurn = false }) => {
    // 3D Shadow Effect
    const shadow3D = "shadow-[inset_-3px_-3px_5px_rgba(0,0,0,0.4),inset_2px_2px_5px_rgba(255,255,255,0.4),1px_2px_4px_rgba(0,0,0,0.6)]";

    // Glow Effect for Current Turn
    const shadowActive = "shadow-[0_0_10px_rgba(255,255,0,0.8),inset_-3px_-3px_5px_rgba(0,0,0,0.4)]";

    
    return (
        <div
            className={`
                /* Dimension and Shape */
                w-[65%] h-[65%] 
                rounded-full 
                aspect-square
                
                /* Positioning */
                m-auto 
                relative 
                top-[15%] left-[5%]
                z-10

                /* Base Styling */
                border-2 
                transition-all duration-300 ease-in-out
                cursor-default

                /* Current Turn Logic */
                ${isCurrentTurn 
                    ? `
                        scale-[1.15] 
                        z-20 
                        border-[#ffff00] 
                        ${shadowActive} 
                        animate-pulse
                      `
                    : `
                        border-white 
                        ${shadow3D}
                      `
                }
            `}
            style={{ backgroundColor: color }}
            title={`Pedina di ${id}`}
        >
        </div>
    );
}

export default React.memo(Pawn);