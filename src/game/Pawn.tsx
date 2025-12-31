import React from "react";
import './Pawn.css'

interface PawnProps {
    id: string;      // chracter ID (es. "scarlet", "mustard", ecc.)
    color: string; // Pawn Color (es. "#FF0000" for red
    isCurrentTurn?: boolean; // if is the current player's turn (highlight the pawn)
}

const Pawn: React.FC<PawnProps> = ({ id, color, isCurrentTurn = false }) => {
    return (
        <div
            className={`
                pawn
                pawn-${id}
                ${isCurrentTurn ? 'current-turn' : ''}
            `}
            style={{ backgroundColor: color }}
            title={`Pedina di ${id}`}
        >
        </div>
    );
}

export default React.memo(Pawn);