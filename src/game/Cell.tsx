import React from "react";
import { CELL_TYPES, type CellDefinition } from "@cluedo-digital/shared";



const Cell: React.FC<CellDefinition> = ({ x, y, type, doorTo, startForSuspect, onClick, children, isHighlighted }) => {

    const isInteractive = type !== CELL_TYPES.VOID;

    return (
        <div
            onClick={() => isInteractive && onClick(x, y)}
            className={`
                board-cell
                cell-type-${type}
                ${isHighlighted ? 'highlight' : ''}
                ${!isInteractive ? 'disabled' : ''}
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
        </div>
    );
};

export default React.memo(Cell);
