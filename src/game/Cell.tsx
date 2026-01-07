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
                /* 1. STRUTTURA (Nostra Logica) */
                relative                  /* FONDAMENTALE per le pedine */
                w-full h-full             /* Occupa tutta la cella della griglia */
                flex items-center justify-center
                
                /* 2. INTERATTIVITÀ */
                ${!isInteractive ? 'pointer-events-none' : ''}
                
                /* 3. ESTETICA (Logica del Collega) */
                /* Usiamo il suo stile rosso pulsante per coerenza con il resto del suo design */
                ${isHighlighted 
                    ? 'bg-red-400/60 cursor-pointer shadow-[inset_0_0_10px_rgba(250,204,21,0.6)] animate-pulse hover:bg-red-400/80' 
                    : ''
                }
            `}
            
            // Manteniamo il posizionamento esplicito grid del collega per sicurezza
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
            }}
            data-x={x}
            data-y={y}
            title={doorTo ? `Porta: ${doorTo}` : startForSuspect ? `Start: ${startForSuspect}` : ''}
        >
            {/* Le Pedine vengono renderizzate qui */}
            {children}

            {/* DECORAZIONE DEL COLLEGA: Pallino rosso centrale se evidenziato */}
            {isHighlighted && (
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-glow absolute pointer-events-none opacity-80" />
            )}
        </div>
    );
};

export default React.memo(Cell);