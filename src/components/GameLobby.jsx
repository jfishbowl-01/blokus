import { useState } from 'react';

export default function GameLobby({
  game,
  players,
  loading,
  onCreateGame,
  onJoinGame,
  onStartGame,
  showOffline,
  onStartOffline
}) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoin = (event) => {
    event.preventDefault();
    if (!roomCode.trim()) return;
    onJoinGame(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Multiplayer Lobby
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            Blokus is better with friends.
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Create a room, share the code, and wait for all four colors to join.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateGame}
              disabled={loading}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
            {showOffline ? (
              <button
                type="button"
                onClick={onStartOffline}
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
              >
                Offline Mode
              </button>
            ) : null}
            {game?.room_code ? (
              <div className="rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-semibold tracking-[0.3em] text-slate-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
                {game.room_code}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleJoin} className="mt-6 grid gap-3">
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              placeholder="Room code"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
            />
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
            >
              Join Room
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-white">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">
            Waiting Players
          </h2>
          <div className="mt-4 grid gap-3">
            {[0, 1, 2, 3].map((index) => {
              const player = players?.[index];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {player?.player_name || player?.color || 'Open slot'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-400">
                    {player ? 'Joined' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onStartGame}
            disabled={players?.length !== 4}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
