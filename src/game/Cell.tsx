import React from "react";
import { CELL_TYPES, type CellType } from "@cluedo-digital/shared";

interface CellProps {
    x: number;
    y: number;
    type: CellType;
    onClick: (x: number, y: number) => void;
    children?: React.ReactNode;
    isHighlighted?: boolean;
}

const Cell: React.FC<CellProps> = ({ x, y, type, onClick, children, isHighlighted }) => {

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
        >
            {children}
        </div>
    );
};

export default React.memo(Cell);
