
import React, { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { useFriends } from '../hooks/useFriends';
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import ProfileView from '../components/ProfileView';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    avatarUrl?: string;
    isOnline: boolean;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    rank?: number;
}

const LeaderboardPage: React.FC = () => {
    // 1. Get Current User Data
    const user = useAppSelector(state => state.user);

    // User data from Redux
    const currentUser = {
        displayName: user.displayName,
        avatar: user.avatarUrl,
        isOnline: user.isOnline
    };

    // 2. Get Friends Data
    const { friends } = useFriends();

    // 3. Combine and Process Data
    const leaderboardData = useMemo(() => {
        // Create entry for current user
        const currentUserEntry: LeaderboardEntry = {
            uid: user.uid,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isOnline: user.isOnline,
            gamesPlayed: user.stats.gamesPlayed,
            wins: user.stats.wins,
            losses: user.stats.losses,
            winRate: user.stats.gamesPlayed > 0
                ? Math.round((user.stats.wins / user.stats.gamesPlayed) * 100)
                : 0
        };

        // Create entries for friends
        // Note: FriendProfile now includes stats thanks to our previous updates
        const friendEntries: LeaderboardEntry[] = friends.map(friend => ({
            uid: friend.uid,
            displayName: friend.displayName,
            avatarUrl: friend.avatarUrl,
            isOnline: friend.isOnline,
            gamesPlayed: friend.stats.gamesPlayed,
            wins: friend.stats.wins,
            losses: friend.stats.losses,
            winRate: friend.stats.gamesPlayed > 0
                ? Math.round((friend.stats.wins / friend.stats.gamesPlayed) * 100)
                : 0
        }));

        // Combine all entries
        const allEntries = [currentUserEntry, ...friendEntries];

        // Sort by Win Rate (DESC), then Games Played (DESC)
        return allEntries
            .sort((a, b) => {
                if (b.winRate !== a.winRate) return b.winRate - a.winRate;
                return b.gamesPlayed - a.gamesPlayed;
            })
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

    }, [user, friends]);

    // Helper for rank badge
    const RankBadge = ({ rank }: { rank: number }) => {
        if (rank === 1) return <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold shadow-lg shadow-yellow-400/20"><Trophy className="w-5 h-5" /></div>;
        if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold shadow-lg"><Medal className="w-5 h-5" /></div>;
        if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-400 text-orange-900 flex items-center justify-center font-bold shadow-lg"><Medal className="w-5 h-5" /></div>;
        return <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">{rank}</div>;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative">
            <HamburgerWithNotifications user={currentUser} />

            <div className="p-4 md:p-8 overflow-y-auto h-screen">
                <div className="max-w-4xl mx-auto pb-20">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-4 ring-1 ring-yellow-500/30">
                            <Trophy className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Classifica Detective</h1>
                        <p className="text-slate-400 text-lg">I migliori investigatori tra i tuoi amici</p>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                            <div className="col-span-6 md:col-span-5">Investigatore</div>
                            <div className="col-span-2 md:col-span-2 text-center hidden md:block">Casi</div>
                            <div className="col-span-2 md:col-span-2 text-center text-emerald-400 hidden md:block">Vinti</div>
                            <div className="col-span-4 md:col-span-2 text-right pr-4">Win Rate</div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-800/50">
                            {leaderboardData.map((entry) => (
                                <div
                                    key={entry.uid}
                                    className={`
                                        grid grid-cols-12 gap-4 p-4 items-center transition-all duration-300
                                        ${entry.uid === user.uid ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 'hover:bg-slate-800/50'}
                                    `}
                                >
                                    {/* Rank */}
                                    <div className="col-span-2 md:col-span-1 flex justify-center">
                                        <RankBadge rank={entry.rank || 0} />
                                    </div>

                                    {/* User */}
                                    <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                                        <div className="relative">
                                            <ProfileView
                                                name={entry.displayName}
                                                imageUrl={entry.avatarUrl}
                                                size="small"
                                                isOnline={entry.isOnline}
                                            />
                                            {entry.rank === 1 && (
                                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded text-black border border-white shadow-sm">
                                                    MVP
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold truncate ${entry.uid === user.uid ? 'text-yellow-400' : 'text-white'}`}>
                                                {entry.displayName} {entry.uid === user.uid && '(Tu)'}
                                            </span>
                                            <span className="text-xs text-slate-500 md:hidden">
                                                {entry.wins} vittorie su {entry.gamesPlayed} casi
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats (Desktop) */}
                                    <div className="col-span-2 md:col-span-2 text-center hidden md:block">
                                        <div className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                                            <span className="text-slate-300 font-mono text-sm">{entry.gamesPlayed}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-2 text-center hidden md:block">
                                        <div className="inline-flex items-center gap-1.5 bg-emerald-950/30 px-2.5 py-1 rounded-md border border-emerald-900/50">
                                            <span className="text-emerald-400 font-mono text-sm font-bold">+{entry.wins}</span>
                                        </div>
                                    </div>

                                    {/* Win Rate */}
                                    <div className="col-span-4 md:col-span-2 text-right pr-4">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-xl font-black ${entry.winRate >= 50 ? 'text-emerald-400'
                                                : entry.winRate >= 30 ? 'text-yellow-400'
                                                    : 'text-slate-400'
                                                }`}>
                                                {entry.winRate}%
                                            </span>
                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${entry.winRate >= 50 ? 'bg-emerald-400'
                                                        : entry.winRate >= 30 ? 'bg-yellow-400'
                                                            : 'bg-slate-600'
                                                        }`}
                                                    style={{ width: `${entry.winRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
