import React from "react";
import { CELL_TYPES, type CellDefinition } from "@cluedo-digital/shared";

const Cell: React.FC<CellDefinition> = ({ x, y, type, doorTo, startForSuspect, onClick, children, isHighlighted }) => {

    const isInteractive = type !== CELL_TYPES.VOID;

    return (
        <div
            onClick={() => isInteractive && onClick(x, y)}
            // 1. relative: FONDAMENTALE. Costringe la pedina a stare dentro questo div.
            // 2. flex-1: Si allarga per riempire lo spazio nella riga (nuovo layout Board).
            className={`
                relative 
                flex-1 
                flex items-center justify-center
                transition-colors duration-200
                
                ${/* Se è un muro (VOID), non mostriamo puntatori o altro */ ''}
                ${!isInteractive ? '' : 'cursor-pointer hover:bg-white/10'}
                
                ${/* Highlight per le mosse valide (Giallo semitrasparente) */ ''}
                ${isHighlighted ? 'bg-yellow-400/40 ring-inset ring-2 ring-yellow-400' : ''}
            `}
            
            // RIMOSSO: style={{ gridColumnStart... }} 
            // Non serve più perché il nuovo Board.tsx gestisce la posizione con l'ordine naturale del Flexbox.

            data-x={x}
            data-y={y}
            title={doorTo ? `Porta: ${doorTo}` : startForSuspect ? `Start: ${startForSuspect}` : ''}
        >
            {children}
        </div>
    );
};

export default React.memo(Cell);