// LobbyPage: sala d'attesa prima della partita

// Mostra i giocatori connessi in tempo reale usando Firestore.
// Il match BoardGame.io viene creato solo quando l'host avvia la partita.


import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Users, Copy, Play, Loader2, LogOut, Check, Crown, Gamepad2 } from 'lucide-react';
import HamburgerWithNotifications from '../components/hamburgerSidebar/HamburgerWithNotifications';
import { usePreLobby } from '../hooks/usePreLobby';
import { useFriends } from '../hooks/useFriends';
import { useLobbyInvites } from '../hooks/useLobbyInvites';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode: string }>();
  const user = useAppSelector(state => state.user);
  const [copied, setCopied] = useState(false);

  // Hook pre-lobby con sottoscrizione Firestore real-time
  const {
    room,
    roomCode,
    isHost,
    players,
    playerCount,
    canStartGame,
    isStarting,
    error,
    leaveRoom,
    startGame,
  } = usePreLobby();

  // Hook amici per invitare
  const { onlineFriends } = useFriends();
  const { sendInvite } = useLobbyInvites();

  // User data for sidebar
  const currentUser = {
    displayName: user.displayName,
    avatar: user.avatarUrl,
    isOnline: user.isOnline
  };

  // Usa il roomCode dall'URL se disponibile, altrimenti quello dal hook
  const displayRoomCode = roomCode || urlRoomCode;

  // Se non c'è una room, redirect alla home
  if (!room || !displayRoomCode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-4" />
        <p className="text-slate-400">Caricamento lobby...</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-4 text-slate-500 hover:text-white underline"
        >
          Torna alla Home
        </button>
      </div>
    );
  }

  // Copia codice negli appunti
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(displayRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gestisci uscita dalla lobby
  const handleLeave = async () => {
    await leaveRoom();
    navigate('/home');
  };

  // Avvia la partita
  const handleStartGame = async () => {
    if (canStartGame) {
      await startGame();
    }
  };

  const maxPlayers = room.maxPlayers;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Sidebar */}
      <HamburgerWithNotifications user={currentUser} />

      {/* Back/Leave Button - fixed position like hamburger */}
      <button
        onClick={handleLeave}
        disabled={isStarting}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-700"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden sm:inline">Esci dalla lobby</span>
      </button>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 pt-20">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isHost ? 'La tua Lobby' : 'Lobby'}
          </h1>
          <p className="text-slate-400">
            {isHost ? 'Condividi il codice con i tuoi amici' : "In attesa che l'host avvii la partita"}
          </p>

          {/* Real-time indicator */}
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Aggiornamenti in tempo reale
          </div>
        </div>

        {/* Errore */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 max-w-md text-center">
            {error}
          </div>
        )}

        {/* Room Code Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 text-center">
          <p className="text-sm text-slate-400 mb-2">Codice Stanza</p>
          <div className="flex items-center justify-center gap-4">
            <code className="text-3xl md:text-4xl font-mono font-bold tracking-widest text-yellow-500 bg-slate-800 px-6 py-3 rounded-lg select-all">
              {displayRoomCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
              title="Copia codice"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 group-hover:text-yellow-500" />
              )}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {copied ? 'Copiato!' : 'Clicca per copiare e condividere con i tuoi amici'}
          </p>
        </div>

        {/* Invite Friends Section - Only for host when there are online friends */}
        {isHost && onlineFriends.length > 0 && playerCount < maxPlayers && (
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium text-sm">Invita Amici Online</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {onlineFriends.slice(0, 5).map((friend) => (
                <button
                  key={friend.uid}
                  onClick={() => sendInvite(friend.uid, displayRoomCode)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-yellow-500 hover:text-black rounded-lg transition-colors text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-xs">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      friend.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{friend.displayName}</span>
                </button>
              ))}
            </div>
            {onlineFriends.length > 5 && (
              <p className="text-xs text-slate-500 mt-2">+{onlineFriends.length - 5} altri amici online</p>
            )}
          </div>
        )}

        {/* Players List */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold">Giocatori ({playerCount}/{maxPlayers})</h2>
          </div>

          <div className="space-y-3">
            {/* Giocatori connessi */}
            {players.map((player) => (
              <div
                key={player.uid}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden">
                    {player.avatarUrl ? (
                      <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      player.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {player.name}
                      {player.uid === user.uid && (
                        <span className="text-xs text-slate-500">(tu)</span>
                      )}
                    </p>
                    {player.index === 0 && (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Host
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                  <Check className="w-3 h-3" />
                  Pronto
                </div>
              </div>
            ))}

            {/* Slot vuoti */}
            {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-3 rounded-lg bg-slate-800/50 border-2 border-dashed border-slate-700"
              >
                <span className="text-slate-600">Slot {playerCount + i + 1} - In attesa...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={!canStartGame || isStarting}
            className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl transition-colors"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Avvio in corso...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Avvia Partita ({playerCount} giocatori)
              </>
            )}
          </button>
        ) : (
          <div className="text-slate-400 text-center">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            In attesa che l'host avvii la partita...
          </div>
        )}

        {/* Min players warning */}
        {isHost && playerCount < 3 && (
          <p className="mt-4 text-sm text-slate-500">
            Servono almeno 3 giocatori per iniziare ({3 - playerCount} mancanti)
          </p>
        )}

        {/* Info sulla room */}
        <div className="mt-8 text-xs text-slate-600 text-center">
          <p>Room: {displayRoomCode} • Max {maxPlayers} giocatori</p>
        </div>
      </main>
    </div>
  );
};

export default LobbyPage;
