import React from "react";
import { CELL_TYPES, type CellDefinition } from "@cluedo-digital/shared";



const Cell: React.FC<CellDefinition> = ({ x, y, type, doorTo, startForSuspect, onClick, children, isHighlighted }) => {

    const isInteractive = type !== CELL_TYPES.VOID;

    return (
        <div
            onClick={() => isInteractive && onClick(x, y)}
            className={`
                relative
                flex items-center justify-center
                ${isHighlighted 
                    ? 'bg-red-400/80 cursor-pointer shadow-[inset_0_0_10px_rgba(250,204,21,0.6)] animate-pulse hover:bg-red-400/90' 
                    : ''
                }
                ${!isInteractive ? 'pointer-events-none' : ''}
            `}
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
            }}
            data-x={x}
            data-y={y}
            title={doorTo ? `Porta: ${doorTo}` : startForSuspect ? `Start: ${startForSuspect}` : ''}
        >
            {children}
            {isHighlighted && (
                <div className="w-3 h-3 bg-red-400/100 rounded-full shadow-glow absolute pointer-events-none" />
            )}
        </div>
    );
};

export default React.memo(Cell);
