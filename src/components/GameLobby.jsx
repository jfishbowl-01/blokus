import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_DISPLAY_COLORS,
  DISPLAY_COLOR_OPTIONS,
  getUniqueDisplayColor,
  normalizeHexColor,
  resolveDisplayColor
} from '../utils/colors.js';

export default function GameLobby({
  game,
  players,
  loading,
  onCreateGame,
  onJoinGame,
  onStartGame,
  showOffline,
  onStartOffline,
  showFillAI,
  onFillWithAI
}) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [displayColor, setDisplayColor] = useState(DEFAULT_DISPLAY_COLORS.blue);
  const [copyStatus, setCopyStatus] = useState('');
  const nameInputRef = useRef(null);

  const handleJoin = (event) => {
    event.preventDefault();
    if (!roomCode.trim()) return;
    onJoinGame(roomCode.trim().toUpperCase(), playerName.trim(), displayColor);
  };
  const handleCopyInvite = async () => {
    if (typeof window === 'undefined' || !game?.room_code) return;
    const url = `${window.location.origin}/?room=${game.room_code}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt('Copy invite link:', url);
      }
      setCopyStatus('Copied!');
    } catch (error) {
      window.prompt('Copy invite link:', url);
      setCopyStatus('Copy ready');
    } finally {
      window.setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const takenColors = useMemo(() => {
    const colors = new Set();
    (players || []).forEach((player) => {
      colors.add(resolveDisplayColor(player));
    });
    return colors;
  }, [players]);
  const normalizedDisplayColor = normalizeHexColor(displayColor);
  const isColorTaken = normalizedDisplayColor ? takenColors.has(normalizedDisplayColor) : false;
  const colorOptions = useMemo(() => DISPLAY_COLOR_OPTIONS, []);

  useEffect(() => {
    if (game?.room_code && game.room_code !== roomCode) {
      setRoomCode(game.room_code);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }
  }, [game?.room_code, roomCode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (roomCode) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setRoomCode(code.toUpperCase());
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }
  }, [roomCode]);

  useEffect(() => {
    if (!normalizedDisplayColor) {
      setDisplayColor(getUniqueDisplayColor(DEFAULT_DISPLAY_COLORS.blue, takenColors));
      return;
    }
    const isAllowed = DISPLAY_COLOR_OPTIONS.includes(normalizedDisplayColor);
    const isTaken = takenColors.has(normalizedDisplayColor);
    if (!isAllowed || isTaken) {
      setDisplayColor(getUniqueDisplayColor(DEFAULT_DISPLAY_COLORS.blue, takenColors));
    }
  }, [normalizedDisplayColor, takenColors]);

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
              <>
                <div className="rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-semibold tracking-[0.3em] text-slate-700 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
                  {game.room_code}
                </div>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
                >
                  {copyStatus || 'Copy Code'}
                </button>
              </>
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
              ref={nameInputRef}
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
            />
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Your Color
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
                {colorOptions.map((color) => {
                  const normalized = normalizeHexColor(color);
                  const isTaken = normalized ? takenColors.has(normalized) : false;
                  const isSelected = normalizedDisplayColor === normalized;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setDisplayColor(color)}
                      disabled={isTaken}
                      aria-pressed={isSelected}
                      className={`relative h-8 w-8 rounded-full border transition ${
                        isSelected
                          ? 'border-slate-900 ring-2 ring-slate-900/30'
                          : 'border-transparent'
                      } ${isTaken ? 'cursor-not-allowed opacity-40' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                      title={isTaken ? 'Taken' : color}
                    >
                      {isSelected ? (
                        <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white shadow" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || isColorTaken}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
            >
              Join Room
            </button>
            {isColorTaken ? (
              <p className="text-xs text-amber-600 dark:text-amber-300">
                That color is taken. Pick another to continue.
              </p>
            ) : null}
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
          {showFillAI ? (
            <button
              type="button"
              onClick={onFillWithAI}
              className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
            >
              Fill With AI
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
