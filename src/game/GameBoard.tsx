import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { BoardProps } from "boardgame.io/dist/types/packages/react";
import type { CluedoGameState } from "@cluedo-digital/shared";
import { useGameStatsSync } from '../hooks/useGameStatsSync';
import { useTurnTimer, TURN_TIMEOUT_MS, REFUTATION_TIMEOUT_MS } from '../hooks/useTurnTimer';
import Board from "./Board";
import PlayerSidebar from "../components/PlayerSidebar";
import { Notebook } from "../components/Notebook";
import { GameModals } from "../components/GameModals";
import GameCard from "./GameCard";
import DiceRoller from "./DiceRoller";
import { getCardImage } from "../utils/assets";
import { clearMatchCredentials } from "../services/lobbyClient";
import { Dices, LogOut, AlertTriangle, Home, Clock } from "lucide-react";
import background from '../assets/board/bgcluedo.jpg';

// Tipo delle props che GamePage riceve: sono le props standard di una board di boardgame.io, parametrizzate con il tipo di stato del gioco Cluedo.
type GamePageProps = BoardProps<CluedoGameState>;

const GamePage: React.FC<GamePageProps> = (props) => { // Definiamo il componente GamePage che riceve le props del gioco
    // Destructuring props: estraiamo le proprietà principali da props per comodità, quali G (lo stato di gioco), ctx (il contesto di gioco), playerID, matchID, moves (le mosse disponibili) ed events (gli eventi di gioco).
    const { G, ctx, playerID, matchID, moves, events } = props;

    // Recupera il MIO oggetto giocatore dallo stato G
    // Nota: playerID qui è string ("0"), lo usiamo per cercare in G.players
    const myPlayerG = playerID ? G.players[playerID] : null;

    // CALCOLA IL NOME DEL VINCITORE (Serve per la cronologia)
    // Se c'è un gameover, cerchiamo il nome del vincitore. Altrimenti undefined.
    // Gestiamo anche il caso in cui winner sia null (es. pareggio/tutti arresi)
    const winnerID = ctx.gameover?.winner;
    const winnerName = (winnerID !== undefined && winnerID !== null)
        ? G.players[winnerID]?.name
        : "Nessuno";

    // ATTIVA LA SINCRONIZZAZIONE
    // Passiamo i dati necessari. L'hook farà tutto da solo in background.
    useGameStatsSync(
        matchID,
        ctx.gameover,
        playerID,
        myPlayerG?.firebaseUID, // Passiamo l'UID salvato in G
        myPlayerG?.character,
        winnerName
    );



    const navigate = useNavigate();

    // Stato per il modale di conferma abbandono
    const [showSurrenderModal, setShowSurrenderModal] = useState(false);

    // Funzione per abbandonare e tornare alla home
    const handleSurrender = () => {
        moves.surrender();
        setShowSurrenderModal(false);
    };

    // Funzione per uscire dal gioco (dopo eliminazione)
    const handleLeaveGame = () => {
        clearMatchCredentials();
        navigate('/home');
    };

    // Identify my player: cerchiamo il giocatore (oggetto player) corrispondente al playerID corrente, se esiste.
    const myPlayer = playerID ? G.players[playerID] : null;

    // ========================================
    // TIMEOUT SYSTEM
    // ========================================

    // Determina se è il mio turno
    const isMyTurn = playerID === ctx.currentPlayer;

    // Determina se sono in fase di smentita (devo rispondere io)
    const isMyRefutation = G.currentSuggestion?.currentResponder === playerID;

    // Callback per auto-eliminazione quando scade il tempo del turno
    // NOTA: Qualsiasi client può chiamare questa mossa quando scade il timeout.
    // BoardGame.io gestisce le race condition e processa solo la prima chiamata.
    const handleTurnTimeout = useCallback(() => {
        // Non chiamare se il gioco è finito o se il currentPlayer è già eliminato
        const currentPlayer = G.players[ctx.currentPlayer];
        if (!ctx.gameover && currentPlayer && !currentPlayer.isEliminated) {
            console.log('[TIMEOUT] Tempo turno scaduto - auto eliminate current player (triggered by any client)');
            moves.timeoutCurrentPlayer();
        }
    }, [G.players, ctx.currentPlayer, ctx.gameover, moves]);

    // Callback per auto-skip quando scade il tempo della smentita
    // NOTA: Qualsiasi client può chiamare questa mossa quando scade il timeout.
    // BoardGame.io gestisce le race condition e processa solo la prima chiamata.
    const handleRefutationTimeout = useCallback(() => {
        // Solo se c'è una smentita pendente e il gioco non è finito
        if (G.currentSuggestion && !ctx.gameover) {
            console.log('[TIMEOUT] Tempo smentita scaduto - auto skip (triggered by any client)');
            moves.skipRefutation();
        }
    }, [G.currentSuggestion, ctx.gameover, moves]);

    // Timer per il turno - ATTIVO PER TUTTI I CLIENT
    // Questo garantisce che anche se il giocatore di turno è disconnesso,
    // gli altri client triggereranno comunque il timeout.
    const currentPlayerData = G.players[ctx.currentPlayer];
    const isTurnActive = currentPlayerData && !currentPlayerData.isEliminated && !ctx.gameover;
    const { remainingSeconds: turnSeconds } = useTurnTimer({
        startTime: G.turnStartedAt,
        timeoutMs: TURN_TIMEOUT_MS,
        onTimeout: handleTurnTimeout,
        enabled: isTurnActive
    });

    // Timer per la smentita - ATTIVO PER TUTTI I CLIENT quando c'è una smentita pendente
    // Questo garantisce che anche se il giocatore che deve smentire è disconnesso,
    // gli altri client triggereranno comunque il timeout.
    const isRefutationPending = G.currentSuggestion !== null;
    const { remainingSeconds: refutationSeconds } = useTurnTimer({
        startTime: G.stageStartedAt,
        timeoutMs: REFUTATION_TIMEOUT_MS,
        onTimeout: handleRefutationTimeout,
        enabled: isRefutationPending && !ctx.gameover
    });

    // Data preparation: creazione di una lista ordinata di tutti i giocatori per visualizzarli nella sidebar.
    const playersList = useMemo(() => { // Wrappato in useMemo per evitare ricalcoli inutili se G.players non cambia
        return Object.values(G.players).sort((a, b) => a.id.localeCompare(b.id)); // Prendiamo i giocatori come array e li ordiniamo per ID
    }, [G.players]);

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

                <div className="flex items-center gap-4">
                    {/* TIMER DISPLAY */}
                    {!ctx.gameover && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isMyRefutation
                            ? 'bg-orange-900/50 border-orange-700 text-orange-300'
                            : isMyTurn && !myPlayer?.isEliminated
                                ? 'bg-amber-900/50 border-amber-700 text-amber-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-bold text-sm">
                                {isMyRefutation
                                    ? `${refutationSeconds}s`
                                    : isMyTurn && !myPlayer?.isEliminated
                                        ? `${turnSeconds}s`
                                        : '--'
                                }
                            </span>
                            {isMyRefutation && (
                                <span className="text-xs opacity-75">Smentita</span>
                            )}
                        </div>
                    )}

                    <div className="px-4 py-1 bg-slate-800 rounded-full border border-slate-700 text-sm font-medium">
                        Turno: <span className="text-yellow-400">{ctx.turn}</span>
                    </div>

                    {/* Pulsante Abbandona - solo se non già eliminato */}
                    {myPlayer && !myPlayer.isEliminated && (
                        <button
                            onClick={() => setShowSurrenderModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-white rounded-lg border border-red-800 transition-colors text-sm"
                            title="Abbandona partita"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Abbandona</span>
                        </button>
                    )}
                </div>
            </header>

            {/* MODALE CONFERMA ABBANDONO */}
            {showSurrenderModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Abbandonare la partita?</h2>
                        </div>

                        <p className="text-slate-400 mb-6">
                            Se abbandoni, verrai eliminato dalla partita e non potrai più giocare.
                            La partita continuerà per gli altri giocatori.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowSurrenderModal(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleSurrender}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium"
                            >
                                Abbandona
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BANNER GIOCATORE ELIMINATO */}
            {myPlayer?.isEliminated && !ctx.gameover && (
                <div className="bg-red-900/80 border-b border-red-700 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-red-200">
                            Sei stato eliminato. Puoi continuare a guardare la partita o uscire.
                        </span>
                    </div>
                    <button
                        onClick={handleLeaveGame}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Torna alla Home
                    </button>
                </div>
            )}

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
                {/* --- BACKGROUND IMAGE --- */}
                    <div className="absolute inset-0 z-0 select-none pointer-events-none">
                        {/* Immagine di sfondo */}
                        <img 
                            src={background} 
                            alt="Table Background" 
                            className="w-full h-full object-cover opacity-20 blur-[2px]" 
                        />
                        {/* Overlay sfumato per scurire ulteriormente e uniformare */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/20 to-slate-900/50" />
                    </div>

                    <div className="relative z-10 h-full aspect-square max-w-full shadow-2xl rounded-lg border border-slate-700 overflow-hidden">
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