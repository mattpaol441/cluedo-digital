import React, { useMemo } from "react";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import type { CluedoGameState } from "@cluedo-digital/shared";

//Import components
import Board from "../game/Board";
import PlayerSidebar from "../components/PlayerSidebar";
import { Notebook } from "../components/Notebook";

type GamePageProps = BoardProps<CluedoGameState>;

const GamePage: React.FC<GamePageProps> = (props) => {
    // Destructuring props
    const { G, ctx, playerID, matchID } = props;

    // Data preparation
    const playersList = useMemo(() => {
        return Object.values(G.players).sort((a, b) => a.id.localeCompare(b.id));
    }, [G.players]);

    // Identify my player
    const myPlayer = playerID ? G.players[playerID] : null;

    return (
        // Main Container
        <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden font-sans text-white">

            {/* --- 1. HEADER --- */}
            <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
                <h1 className="text-xl font-bold tracking-widest text-slate-100">
                    CLUEDO <span className="text-red-600">DIGITAL</span>
                </h1>
                
                <div className="px-4 py-1 bg-slate-800 rounded-full border border-slate-700 text-sm font-medium">
                    Turno: <span className="text-yellow-400">{ctx.turn}</span>
                </div>
            </header>

            {/* --- 2. CENTRAL AREA (3 COLUMNS) --- */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* SX COLUMN: PLAYERS */}
                <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-10 p-4 overflow-y-auto">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                        Investigatori
                    </h3>
                    <PlayerSidebar 
                        players={playersList} 
                        currentPlayerId={ctx.currentPlayer}
                    />
                </aside>

                {/* CENTER COLUMN: BOARD */}
                <main className="flex-1 relative bg-slate-800/50 flex items-center justify-center p-2 overflow-hidden">
                    
                    <div className="h-full aspect-square max-w-full shadow-2xl rounded-lg border border-slate-700 overflow-hidden">
                        <Board {...props} />
                    </div>
                </main>

                {/* DX COLUMN: NOTEBOOK */}
                <aside className="w-80 bg-slate-100 border-l border-slate-800 flex flex-col shrink-0 z-10 text-slate-900">
                    <div className="w-full h-full p-2 bg-slate-200">
                         <Notebook 
                            myHand={myPlayer?.hand || []}
                            tableCards={G.tableCards || []}
                            // matchID e playerID servono per salvare i dati giusti
                            matchID={matchID || 'local_match'} 
                            myPlayerID={playerID || 'spectator'}
                         />
                    </div>
                </aside>
            </div>

            {/* --- 3. FOOTER (THE CARDS) --- */}
            <footer className="h-24 bg-slate-950 border-t border-slate-800 shrink-0 px-6 flex items-center justify-center z-20">
                
                <div className="flex gap-4 items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-bold mr-2">
                        La tua mano:
                    </span>
                    
                    {myPlayer?.hand.length ? (
                        <div className="flex gap-3">
                            {myPlayer.hand.map((card) => (
                                <div 
                                    key={card.id} 
                                    className="bg-white text-slate-900 w-24 h-16 rounded shadow-lg flex items-center justify-center text-xs font-bold border-2 border-slate-300 hover:-translate-y-2 transition-transform duration-200 cursor-default"
                                >
                                    {card.name}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-slate-600 italic text-sm">Nessuna carta</span>
                    )}
                </div>
            </footer>

        </div>
    );
};

export default GamePage;