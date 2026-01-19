import React, { useMemo } from "react";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import type { CluedoGameState } from "@cluedo-digital/shared";

import Board from "../game/Board";
import PlayerSidebar from "../components/PlayerSidebar";
import { Notebook } from "../components/Notebook";
import { GameModals } from "../components/GameModals"; 
import GameCard from "../game/GameCard";
import DiceRoller from "../game/DiceRoller";
import { getCardImage } from "../utils/assets"; 
import { Dices } from "lucide-react";

// Tipo delle props che GamePage riceve: sono le props standard di una board di boardgame.io, parametrizzate con il tipo di stato del gioco Cluedo.
type GamePageProps = BoardProps<CluedoGameState>;

const GamePage: React.FC<GamePageProps> = (props) => { // Definiamo il componente GamePage che riceve le props del gioco
    // Destructuring props: estraiamo le proprietà principali da props per comodità, quali G (lo stato di gioco), ctx (il contesto di gioco), playerID, matchID, moves (le mosse disponibili) ed events (gli eventi di gioco).
    const { G, ctx, playerID, matchID, moves, events } = props;

    // Data preparation: creazione di una lista ordinata di tutti i giocatori per visualizzarli nella sidebar.
    const playersList = useMemo(() => { // Wrappato in useMemo per evitare ricalcoli inutili se G.players non cambia
        return Object.values(G.players).sort((a, b) => a.id.localeCompare(b.id)); // Prendiamo i giocatori come array e li ordiniamo per ID
    }, [G.players]);

    // Identify my player: cerchiamo il giocatore (oggetto player) corrispondente al playerID corrente, se esiste.
    const myPlayer = playerID ? G.players[playerID] : null;

    // Estraiamo i valori dei dadi dallo stato di gioco per mostrarli nell'HUD e per controllare se sono stati lanciati.
    const [d1, d2] = G.diceRoll; // Non si riferisce ad alcun player perché i dadi sono condivisi e G.diceRoll rappresenta il risultato del lancio corrente, ovvero del player che sta giocando ora (sono sempre del player attivo).
    const hasRolled = d1 !== 0 && d2 !== 0;
    
    return (
        // Main Container: occupa tutta la finestra (h-screen w-screen), sfondo scuro, layout a colonna, testo bianco.
        <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden font-sans text-white relative">

            {/* 1. DICE ROLLER OVERLAY: Mostra il componente che gestisce il lancio dei dadi, che riceve lo stato di gioco, il contesto, le mosse e l'ID del giocatore attivo */}
            <DiceRoller G={G} ctx={ctx} moves={moves} playerID={playerID} />

            {/* IL GESTORE UNICO: Si occupa di Vittoria, Sconfitta, Accuse ecc.... */}
            {/* React ridisegna GamePage, la GamePage riceve i nuovi dati (G, ctx) ma non li legge nemmeno, si limita a passarli al componente GameModals. */}
            <GameModals 
                G={G} 
                ctx={ctx} 
                moves={moves}
                events={events} 
                playerID={playerID} 
            />
            
            {/* HEADER */}
            <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
                <h1 className="text-xl font-bold tracking-widest text-slate-100">
                    CLUEDO <span className="text-red-600">DIGITAL</span>
                </h1>

                {/* HUD DADI */}
                <div className="flex items-center gap-4 bg-slate-800 px-4 py-1 rounded-full border border-slate-700">
                    <span className="text-slate-400 text-sm font-bold uppercase mr-2">Dadi:</span>
                                        
                    {hasRolled ? ( // Se i dadi sono stati lanciati, mostriamo i valori
                        <div className="flex gap-2">
                           <div className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center rounded shadow">{d1}</div>
                           <div className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center rounded shadow">{d2}</div>
                           <span className="ml-2 font-bold text-yellow-400 text-lg">= {d1 + d2}</span>
                        </div>
                    ) : ( // Altrimenti, mostra un'icona di dadi e la scritta In attesa... 
                        <div className="flex gap-1 opacity-30">
                           <Dices className="w-6 h-6" />
                           <span className="text-sm italic">In attesa...</span>
                        </div>
                    )}
                </div>
                
                <div className="px-4 py-1 bg-slate-800 rounded-full border border-slate-700 text-sm font-medium">
                    Turno: <span className="text-yellow-400">{ctx.turn}</span>
                </div>
            </header>

            {/* CENTRAL AREA (3 COLUMNS): giocatori, plancia, taccuino */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* SX COLUMN: PLAYERS, mostra la lista dei giocatori tramite PlayerSidebar, evidenziando il giocatore di turno. */}
                <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-10 p-4 overflow-y-auto">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                        Investigatori
                    </h3>
                    <PlayerSidebar 
                        players={playersList} 
                        currentPlayerId={ctx.currentPlayer}
                    />
                </aside>

                {/* CENTER COLUMN: BOARD, mostra la plancia di gioco tramite il componente <Board />, che riceve tutte le props necessarie */}
                <main className="flex-1 relative bg-slate-800/50 flex items-center justify-center p-2 overflow-hidden">
                    
                    <div className="h-full aspect-square max-w-full shadow-2xl rounded-lg border border-slate-700 overflow-hidden">
                        <Board {...props} />
                    </div>
                </main>

                {/* DX COLUMN: NOTEBOOK, Da modificare togliendo l'OR [] perchè il Notebook non deve poter funzionare con valori undefined */} 
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
            
            {/* FOOTER (THE CARDS): mostra le carte in mano al giocatore corrente tramite il componente <GameCard /> */}
            <footer className="h-24 bg-slate-950 border-t border-slate-800 shrink-0 px-6 flex items-center justify-center z-20">
                
                <div className="flex gap-4 items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-bold mr-2">
                        La tua mano:
                    </span>
                    
                    {myPlayer?.hand.length ? ( // Se ha carte
                        <div className="flex gap-3 items-end h-28 pb-2">
                            {myPlayer.hand.map((card) => (
                                <GameCard
                                    key={card.id}
                                    card={card}
                                    image={getCardImage(card)}
                                    size="SMALL"
                                    className="hover:-translate-y-6 transition-transform duration-200"
                                />
                            ))}
                        </div>
                    ) : ( // Altrimenti, messaggio Nessuna carta
                        <span className="text-slate-600 italic text-sm">Nessuna carta</span>
                    )}
                </div>
            </footer>

        </div>
    );
};

export default GamePage;