import React from "react";
import { type BoardProps } from "boardgame.io/react";
import { 
    BOARD_LAYOUT, 
    CELL_TYPES, 
    DOOR_MAPPING, 
    STARTING_POSITIONS,
    CHARACTER_COLORS, 
    type CluedoGameState,
    type RoomID,
    type SuspectID } from "@cluedo-digital/shared";

import Cell from "./Cell";
import './Board.css';
import boardBg from "../assets/cluedo-board.jpg";


const getCoordKey = (x: number, y: number) => `${x},${y}`;


type CluedoBoardProps = BoardProps<CluedoGameState>;

const Board: React.FC<CluedoBoardProps> = ({ G, ctx, moves }) => {
    const handleCellClick = (x: number, y: number) => {
        // Controllo base: Se non è il mio turno, ignoro il click (opzionale ma consigliato)
        // const isMyTurn = ctx.currentPlayer === ... (logica clientID)
    
        const key = getCoordKey(x, y);
        console.log(`Cell clicked at (${key}) | Current Player: ${ctx.currentPlayer}`);

        const roomID = DOOR_MAPPING[key];
        if (roomID) {
            console.log(`Player is attempting to enter room: ${roomID}`);
        }
    };

    return (
        <div className="board-container">
            {/* Immagine di Sfondo */}
            <img src={boardBg} alt="Cluedo Board" className="board-image" />

            {/* Griglia delle Celle */}
            <div className="board-grid">
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
                        
                        // Recupero colore (se esiste startFor)
                        const startColor = startFor ? CHARACTER_COLORS[startFor] : undefined;

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
                                {/* Indicatore visivo per i punti di partenza */}
                                {startFor && startColor && (
                                    <div 
                                        className="start-indicator"
                                        style={{ backgroundColor: startColor }}
                                        title={`Partenza: ${startFor}`} 
                                    />
                                )}
                                
                                {/* TODO: Qui mapperemo le pedine dei giocatori (G.players) */}
                            </Cell>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default React.memo(Board);



