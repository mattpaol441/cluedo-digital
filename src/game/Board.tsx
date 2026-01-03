import React from "react";
import { type BoardProps } from "boardgame.io/react";
import { 
    BOARD_LAYOUT, 
    CELL_TYPES, 
    DOOR_MAPPING, 
    STARTING_POSITIONS,
    type CluedoGameState } from "@cluedo-digital/shared";

import Cell from "./Cell";
import Pawn from "./Pawn";

import boardBg from "../assets/board/cluedo-board.jpg";


const getCoordKey = (x: number, y: number) => `${x},${y}`;


type CluedoBoardProps = BoardProps<CluedoGameState>;

const Board: React.FC<CluedoBoardProps> = ({ G, ctx, moves }) => {
    //Helper to show palyer in coord x,y
    const getPlayerAt = (x: number, y: number) => {
        return Object.values(G.players).find(player => 
            player.position.x === x && player.position.y === y && !player.isEliminated
        );
    };

    const handleCellClick = (x: number, y: number) => {
        // Check if the cell is VOID (WALL) or CENTER
        if (BOARD_LAYOUT[y][x] === CELL_TYPES.VOID) { // Rimosso il blocco per CENTER_ROOM dato che ci si può entrare normalmente
            return; // Nothing if VOID or CENTER
        }
        moves.movePawn(x, y);
    };

    return (
        /* Main Container */
        <div className="relative w-full h-full aspect-square flex justify-center items-center mx-auto bg-[#333]">
            {/* Background Image */}
            <img 
                src={boardBg} 
                alt="Cluedo Board" 
                className="w-full h-full object-contain block pointer-events-none select-none" 
            />

            {/* Grid of Cells */}
            <div className="
                absolute 
                top-[1.2%] left-[1.1%] 
                w-[97.8%] h-[97.6%] 
                grid 
                grid-cols-[repeat(25,1fr)] 
                grid-rows-[repeat(25,1fr)] 
                z-10
            ">
                {BOARD_LAYOUT.map((row, y) => 
                    row.map((cellType, x) => {
                        
                        // Generiamo la chiave per il lookup istantaneo
                        const coordKey = getCoordKey(x, y);
                        
                        // 1. Recupero dati diretto (O(1))
                        // Non serve nessuna inversione, i dati sono già pronti
                        
                        // TypeScript sa che doorTo è RoomID | undefined
                        const doorTo = cellType === CELL_TYPES.DOOR 
                            ? DOOR_MAPPING[coordKey] 
                            : undefined;
                        
                        // TypeScript sa che startFor è SuspectID | undefined
                        const startFor = cellType === CELL_TYPES.START 
                            ? STARTING_POSITIONS[coordKey] 
                            : undefined;

                        const playerHere = getPlayerAt(x, y);

                        return (
                            <Cell
                                key={coordKey}
                                x={x}
                                y={y}
                                type={cellType}
                                doorTo={doorTo}
                                startForSuspect={startFor}
                                onClick={handleCellClick}
                                // TODO: isHighlighted={G.validMoves.includes(coordKey)}
                            >
                                
                                {playerHere && (
                                    <Pawn 
                                        id ={playerHere.name}
                                        color={playerHere.color}
                                        isCurrentTurn={ctx.currentPlayer === playerHere.id}
                                    />
                                )}
                            </Cell>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default React.memo(Board);



