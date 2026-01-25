import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { getUserHistory } from '../firebase/users'; // Assicurati che questa funzione esista in users.ts come discusso
import type { MatchHistoryEntry } from '../types/user'; // Assicurati che il tipo sia definito
import { getSuspectName } from '@cluedo-digital/shared'; // Per tradurre gli ID in nomi

// Components
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import ProfileView from '../components/ProfileView';

// Icons
import {
    Trophy,
    XCircle,
    Gamepad2,
    TrendingUp,
    Calendar,
    History,
    Loader2
} from 'lucide-react';

const StatsPage: React.FC = () => {
    // 1. Dati da Redux (Statistiche Globali - Sincronizzate al login/refresh)
    const user = useAppSelector(state => state.user);
    const { stats, displayName, avatarUrl, isOnline } = user;

    // User data from Redux
    const currentUser = {
        displayName: user.displayName,
        avatar: user.avatarUrl,
        isOnline: user.isOnline
    };

    // 2. Stato Locale (Cronologia Partite - Caricata on-demand)
    const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // 3. Calcolo Percentuale Vittorie
    const winRate = stats.gamesPlayed > 0
        ? Math.round((stats.wins / stats.gamesPlayed) * 100)
        : 0;

    // 4. Caricamento Cronologia da Firestore
    useEffect(() => {
        if (user.uid) {
            setLoadingHistory(true);
            getUserHistory(user.uid)
                .then(data => setHistory(data))
                .catch(err => console.error("Errore caricamento cronologia:", err))
                .finally(() => setLoadingHistory(false));
        }
    }, [user.uid]);

    // Componente Helper Interno per le Card
    const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-500 transition-colors">
            {/* Icona di sfondo sfumata */}
            <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
                <Icon className="w-32 h-32" />
            </div>

            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
                {subtext && <p className={`text-xs mt-2 font-medium ${color}`}>{subtext}</p>}
            </div>

            <div className={`p-3 rounded-full bg-slate-800 border border-slate-700 ${color}`}>
                <Icon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">
            {/* Sidebar di Navigazione */}
            <HamburgerWithNotifications user={currentUser} />

            {/* Contenuto Principale */}
            <div className="p-4 md:p-8 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto space-y-8 pb-20">

                    {/* HEADER PROFILO */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 bg-gradient-to-r from-slate-900 to-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <ProfileView
                            name={displayName}
                            imageUrl={avatarUrl}
                            size="large"
                            isOnline={isOnline}
                            variant="simple"
                        />

                        <div className="text-center md:text-left z-10">
                            <h1 className="text-3xl font-bold mb-2">Rapporto Investigativo</h1>
                            <p className="text-slate-400 max-w-lg text-sm md:text-base">
                                Qui sono archiviati tutti i successi e i fallimenti della tua carriera da detective.
                                Ogni indizio conta, ogni partita è una storia.
                            </p>
                        </div>
                    </div>

                    {/* SEZIONE 1: STATISTICHE GLOBALI */}
                    <div>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-yellow-500" />
                            Riepilogo Carriera
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {/* Partite Giocate */}
                            <StatCard
                                label="Casi Totali"
                                value={stats.gamesPlayed}
                                icon={Gamepad2}
                                color="text-blue-400"
                            />

                            {/* Vittorie */}
                            <StatCard
                                label="Vittorie"
                                value={stats.wins}
                                icon={Trophy}
                                color="text-yellow-400"
                            />

                            {/* Sconfitte */}
                            <StatCard
                                label="Sconfitte"
                                value={stats.losses}
                                icon={XCircle}
                                color="text-red-400"
                            />

                            {/* Win Rate */}
                            <StatCard
                                label="Successo"
                                value={`${winRate}%`}
                                icon={TrendingUp}
                                color={winRate >= 50 ? "text-emerald-400" : "text-orange-400"}
                                subtext={winRate >= 50 ? "Detective Esperto" : "Serve più pratica"}
                            />
                        </div>
                    </div>

                    {/* SEZIONE 2: CRONOLOGIA PARTITE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-400" />
                                Ultime 10 Partite
                            </h3>
                            {loadingHistory && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
                        </div>

                        {loadingHistory ? (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                                <p>Recupero archivi...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 bg-slate-900/50">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Nessuna partita recente registrata.</p>
                                <p className="text-xs mt-1">Gioca la tua prima partita per vederla qui!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/50">
                                            <th className="p-4 border-b border-slate-800">Data</th>
                                            <th className="p-4 border-b border-slate-800">Esito</th>
                                            <th className="p-4 border-b border-slate-800">Il tuo Ruolo</th>
                                            <th className="p-4 border-b border-slate-800">Vincitore</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-800">
                                        {history.map((match) => (
                                            <tr key={match.id} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 text-slate-300 font-mono text-xs md:text-sm">
                                                    {new Date(match.date).toLocaleDateString()}
                                                    <span className="text-slate-600 ml-2">
                                                        {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                                                ${match.result === 'WIN'
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }
                                            `}>
                                                        {match.result === 'WIN' ? <Trophy className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {match.result === 'WIN' ? 'VITTORIA' : 'SCONFITTA'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-white font-medium capitalize">
                                                    {getSuspectName(match.character)}
                                                </td>
                                                <td className="p-4 text-slate-400">
                                                    {match.winner}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StatsPage;