import React, { useMemo } from "react";
import { type BoardProps } from "boardgame.io/react";
import { 
    BOARD_LAYOUT, 
    CELL_TYPES, 
    DOOR_MAPPING, 
    STARTING_POSITIONS,
    CHARACTER_COLORS,
    type CluedoGameState } from "@cluedo-digital/shared";

import Cell from "./Cell";
import Pawn from "./Pawn";

import boardBg from "../assets/board/cluedo-board.jpg";


const getCoordKey = (x: number, y: number) => `${x},${y}`;


// PROBLEMA ORIGINALE: La pedina veniva disegnata sempre al centro della cella. Se avessimo disegnato due pedine, sarebbero state perfettamente sovrapposte (una sopra l'altra), nascondendo quella sotto.
// HELPER PER L'OFFSET VISIVO DELLE PEDINE: Prima si usava una funzione getPlayerAt(x, y) basata su .find(). VECCHIO CODICE: return Object.values(G.players).find(...) // Si ferma appena ne trova UNO!
// Se Scarlet e Mustard erano nella stessa stanza, la funzione trovava Scarlet, restituiva "Scarlet" e si fermava. Mustard, pur essendo lì, veniva ignorato e non veniva disegnato.
// Introducendo playersByCell usando useMemo, invece di chiedere se c'è qualcuno chiediamo di restituire la lista di tutti quelli che sono in una cella. La mappa playersByCell ci dà accesso istantaneo (O(1)) alla lista completa degli occupanti di ogni coordinata.
const getPawnStyle = (index: number, total: number): React.CSSProperties => {
    // CASO A: SINGOLA PEDINA SULLA CELLA
    if (total === 1) {
        return {
            width: '70%', height: '70%',
            left: '15%', top: '15%',
            zIndex: 10
        };
    }
    // CASO B: GRIGLIA (2 o più giocatori su una pedina)
    const size = '45%';
    const col = index % 2;
    const row = Math.floor(index / 2);

    return {
        width: size, height: size,
        left: col === 0 ? '5%' : '50%', 
        top:  row === 0 ? '5%' : '50%',
        zIndex: 10 + index
    };
};


type CluedoBoardProps = BoardProps<CluedoGameState>;

const Board: React.FC<CluedoBoardProps> = ({ G, ctx, moves }) => {
    // LOGICA RAGGRUPPAMENTO (Sostituisce getPlayerAt)
    // ciclo su tutti i giocatori...
    // L'output prodotto è un dizionario fatto così: map["3,4"] = [Scarlet, Mustard]; Crea una sorta di lista di persone per ogni cella, e lo fa una volta sola ogni volta che qualcuno si muove
    const playersByCell = useMemo(() => { // useMemo trasforma i dati di G.players in un "elenco" ordinato e organizzato per stanza
        const map: Record<string, typeof G.players[string][]> = {};
        
        Object.values(G.players).forEach(player => {
            // Se vuoi nascondere gli eliminati, decommenta la riga sotto:
            // if (player.isEliminated) return;

            const key = getCoordKey(player.position.x, player.position.y);
            if (!map[key]) map[key] = [];
            map[key].push(player);
        });
        
        return map;
    }, [G.players]);

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

                        // Per il colore indicatori start
                        const startColor = startFor && CHARACTER_COLORS ? CHARACTER_COLORS[startFor] : undefined;

                        // --- 3. RECUPERO TUTTI I GIOCATORI ---
                        const playersHere = playersByCell[coordKey] || []; // Con questa riga recuperiamo la lista di TUTTI i giocatori in questa cella

                        return (
                            <Cell
                                key={coordKey}
                                x={x}
                                y={y}
                                type={cellType}
                                doorTo={doorTo}
                                startForSuspect={startFor}
                                onClick={handleCellClick}
                            >
                                {/* Indicatore Start (Opzionale, se vuoi vederlo visivamente) */}
                                {startFor && startColor && (
                                     <div 
                                        className="absolute inset-0 opacity-30 border-2 pointer-events-none"
                                        style={{ backgroundColor: startColor, borderColor: startColor }}
                                    />
                                )}
                                
                                {/* MAP SUI GIOCATORI NELLA CELLA */}
                                {playersHere.map((player, index) => { // Ora siamo nella singola cella e dobbiamo disegnare TUTTE le pedine presenti, passando i numeri a getPawnStyle
                                    // Calcoliamo stile dinamico
                                    const pawnStyle = getPawnStyle(index, playersHere.length); // getPawnStyle ora riceve l'indice e il totale e li usa per disegnarli con coordinate diverse, calcolando degli stili diversi. Il loop prende questi stili e li applica al div della pedina
                                    
                                    return (
                                        <div
                                            key={player.id}
                                            style={{
                                                position: 'absolute',
                                                pointerEvents: 'none', // Il click passa alla cella sotto. trucco CSS fondamentale tale che quando si clicca su una pedina, il click passa attraverso la pedina e colpisce il componente Cell sottostante. 
                                                // Questo garantisce che handleCellClick venga sempre attivato correttamente, permettendo di muoversi in quella casella anche se è affollata.
                                                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                ...pawnStyle // width, height, top, left calcolati
                                            }}
                                            className="flex items-center justify-center"
                                        >
                                            <Pawn 
                                                id={player.name}
                                                color={player.color}
                                                isCurrentTurn={ctx.currentPlayer === player.id}
                                            />
                                        </div>
                                    );
                                })}
                            </Cell>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default React.memo(Board);



