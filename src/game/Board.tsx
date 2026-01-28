import React, { useMemo } from "react";
import { type BoardProps } from "boardgame.io/react";
import { 
    BOARD_LAYOUT, 
    CELL_TYPES, 
    DOOR_MAPPING, 
    STARTING_POSITIONS,
    CHARACTER_COLORS,
    type CluedoGameState, 
    // type Player 
} from "@cluedo-digital/shared";

import Cell from "./Cell";
import Pawn from "./Pawn";

import boardBg from "../assets/board/cluedo-board.png";

// Funzione helper che, dati x e y, restituisce una stringa “x,y”. Serve come chiave unica per identificare ogni cella della plancia.
const getCoordKey = (x: number, y: number) => `${x},${y}`;


// PROBLEMA ORIGINALE: La pedina veniva disegnata sempre al centro della cella. Se avessimo disegnato due pedine, sarebbero state perfettamente sovrapposte (una sopra l'altra), nascondendo quella sotto.
// HELPER PER L'OFFSET VISIVO DELLE PEDINE: In realtà prima si usava una funzione getPlayerAt(x, y) basata su .find(). VECCHIO CODICE: return Object.values(G.players).find(...) // Si ferma appena ne trova UNO!
// Se Scarlet e Mustard erano nella stessa stanza, la funzione trovava Scarlet, restituiva "Scarlet" e si fermava. Mustard, pur essendo lì, veniva ignorato e non veniva disegnato.
// Introducendo playersByCell usando useMemo, invece di chiedere se c'è qualcuno chiediamo di restituire la lista di tutti quelli che sono in una cella (così da disegnare tutte le pedine). La mappa playersByCell ci dà accesso istantaneo (O(1)) alla lista completa degli occupanti di ogni coordinata.

// Funzione che calcola lo stile CSS per posizionare le pedine in modo non sovrapposto in base a quante sono nella stessa cella (total) e a quale indice (posizione nell'array delle pedine nella cella) hanno.
const getPawnStyle = (index: number, total: number): React.CSSProperties => {
    // SE SINGOLA PEDINA SULLA CELLA, grande e centrata
    if (total === 1) {
        return {
            width: '70%', height: '70%',
            left: '15%', top: '15%',
            zIndex: 10 // zIndex é una proprietà CSS che determina l'ordine di sovrapposizione degli elementi. Un valore più alto significa che l'elemento sarà visualizzato sopra quelli con valori più bassi.
        };
    }
    // SE 2 O PIÙ GIOCATORI SU UNA PEDINA, si preparano variabili per disporle a griglia
    const size = '45%'; // Dimensione fissa per più pedine
    // Col e row definiscono la posizione nella griglia 
    const col = index % 2; // Index pari, colonna sinistra (0). Dispari, colonna destra (1)
    const row = Math.floor(index / 2);  // Index 0,1 allora riga 0. Index 2,3 allora riga 1

    return { // Restituisce lo stile CSS per la pedina: la posiziona in alto a sinistra, in alto a destra, in basso a sinistra o in basso a destra a seconda di index
        width: size, height: size,
        left: col === 0 ? '5%' : '50%', // Posizionata verso sinistra o destra a seconda di col 
        top:  row === 0 ? '5%' : '50%', // Posizionata verso l'alto o il basso a seconda di row
        zIndex: 10 + index // zIndex crescente per decidere chi sta sopra in caso di sovrapposizioni errate (l’ordine è sempre chiaro e nessuna pedina viene completamente nascosta)
    };
};

// Definisce il tipo delle props che il componente Board riceverà: BoardProps è un tipo fornito da boardgame.io/react, parametrizzato con il tipo di stato del gioco (CluedoGameState).
type CluedoBoardProps = BoardProps<CluedoGameState>;

const Board: React.FC<CluedoBoardProps> = ({ G, ctx, moves }) => { // Definisce il componente Board con le props tipizzate che riceve ovvero stato del gioco G, contesto ctx (turno, player corrente ecc....) e funzioni moves che il FE può invocare per modificare lo stato del gioco 
    // LOGICA DI RAGGRUPPAMENTO (Sostituisce getPlayerAt):
    // Ciclo su tutti i giocatori al fine di raggrupparli per cella, così da sapere in ogni cella chi c'è
    // L'output prodotto è un dizionario fatto così: map["3,4"] = [Scarlet, Mustard]. Crea una sorta di lista di persone per ogni cella, e lo fa una volta sola ogni volta che qualcuno si muove
    // Infatti useMemo serve per memorizzare il risultato di questa operazione costosa (iterare su tutti i giocatori) e rieseguirla solo quando G.players cambia 
    const playersByCell = useMemo(() => { // Inizializzo una mappa (inizialmente vuota) che ha come chiave la stringa "x,y" e come valore un array di giocatori presenti in quella cella.
        const map: Record<string, typeof G.players[string][]> = {};
        
        Object.values(G.players).forEach(player => { // Ciclando su tutti i giocatori in G.players
            // Se vuoi nascondere gli eliminati, decommenta la riga sotto:
            // if (player.isEliminated) return;

            const key = getCoordKey(player.position.x, player.position.y); // Calcola la chiave della cella in cui si trova il giocatore (la sua posizione)
            if (!map[key]) map[key] = []; // Se ancora non esiste un array per quella cella, lo crea
            map[key].push(player); // Poi aggiunge il giocatore all'array di giocatori in quella cella
        }); 
        
        return map; // Alla fine la mappa contiene solo le coordinate occupate, e per ciascuna di esse c’è un array con tutti i player presenti in quella cella.
    }, [G.players]);

    const handleCellClick = (x: number, y: number) => { // Funzione chiamata quando si clicca su una cella, riceve le coordinate x e y della cella cliccata
        const currentPlayer = G.players[ctx.currentPlayer]; // Recupera il giocatore corrente usando ctx.currentPlayer
        const key = getCoordKey(x, y); // Calcola la chiave della cella cliccata

        // Controllo validità mosse 
        if (!currentPlayer.validMoves.includes(key)) {
             console.log(`Cella (${x}, ${y}) non è una mossa valida.`);
             return;
        }
        // // Check if the cell is VOID (WALL) or CENTER
        // if (BOARD_LAYOUT[y][x] === CELL_TYPES.VOID) { // Rimosso il blocco per CENTER_ROOM dato che ci si può entrare normalmente
        //     return; 
        // }

        // Controlliamo se la casella cliccata è una porta della mia stessa stanza.
        // Se sì, blocchiamo il click per evitare errori del server e confusione UI.
        const targetRoom = DOOR_MAPPING[key]; 
        const currentRoom = currentPlayer.currentRoom; 

        if (targetRoom && currentRoom && targetRoom === currentRoom) { // Se clicco su una porta che conduce alla stanza in cui sono già 
            console.warn("Sei già in questa stanza! Devi uscire.");
            return; 
        }
        
        moves.movePawn(x, y); // Se tutti i controlli sono superati, chiama la mossa movePawn passando le coordinate: questa mossa aggiornerà lo stato del gioco (G) spostando la pedina.
    };

    return (
        /* Main Container, o div centrale/principale */
        <div className="relative w-full h-full aspect-square flex justify-center items-center mx-auto bg-[#333]">
            {/* Background Image, immagine di sfondo della plancia */}
            <img 
                src={boardBg} 
                alt="Cluedo Board" 
                className="w-full h-full object-contain block pointer-events-none select-none" 
            />

            {/* Grid of Cells, div assoluto sopra l'immagine, rappresenta la griglia 25x25 delle celle */}
            <div className="
                absolute 
                top-[1.2%] left-[1.1%] 
                w-[97.8%] h-[97.6%] 
                grid 
                grid-cols-[repeat(25,1fr)] 
                grid-rows-[repeat(25,1fr)] 
                z-10
            ">
                {BOARD_LAYOUT.map((row, y) => // Cicla su ogni riga e colonna della plancia per disegnare le celle, quindi per ogni cella della plancia... 
                    row.map((cellType, x) => {
                        
                        // Generiamo la chiave stringa della cella corrente (es. "3,4") per il lookup istantaneo
                        const coordKey = getCoordKey(x, y);
                        
                        // 1. Recupero dati diretto (O(1))
                        // Non serve nessuna inversione, i dati sono già pronti
                        
                        // TypeScript sa che doorTo è RoomID | undefined. Controlla se la cella è una porta
                        const doorTo = cellType === CELL_TYPES.DOOR 
                            ? DOOR_MAPPING[coordKey] 
                            : undefined;
                        
                        // TypeScript sa che startFor è SuspectID | undefined. Controlla se la cella è una posizione di partenza
                        const startFor = cellType === CELL_TYPES.START 
                            ? STARTING_POSITIONS[coordKey] 
                            : undefined;

                        // Per il colore indicatori start (colore associato al personaggio di partenza)
                        const startColor = startFor && CHARACTER_COLORS ? CHARACTER_COLORS[startFor] : undefined;

                        
                        const playersHere = playersByCell[coordKey] || []; // Con questa riga recuperiamo la lista di TUTTI i giocatori in questa cella

                        // Per l'highlight (evidenziare le celle valide per il movimento)
                        const currentPlayer = G.players[ctx.currentPlayer];
                        const isValidMove = currentPlayer.validMoves.includes(coordKey); // Controlla se la cella corrente è una mossa valida per il giocatore corrente

                        return ( // Ritorna il componente Cell che rappresenta quella cella della plancia con tutte le props necessarie 
                            <Cell
                                key={coordKey}
                                x={x}
                                y={y}
                                type={cellType}
                                doorTo={doorTo}
                                startForSuspect={startFor}
                                onClick={handleCellClick}
                                isHighlighted={isValidMove} // Passiamo l'highlight alla cella
                            >
                                {/* Indicatore Start (opzionale, se vuoi vederlo visivamente) */}
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



