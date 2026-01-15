const COLOR_STYLES = {
  blue: 'bg-blue-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  green: 'bg-emerald-500'
};

export default function GameHeader({ game, players, currentTurn, isPlayerTurn, onPass }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${COLOR_STYLES[currentTurn?.color] || 'bg-slate-300'}`}
        />
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Current Turn
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {currentTurn?.player_name || currentTurn?.color || 'Waiting...'}
          </p>
        </div>
        {isPlayerTurn ? (
          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 turn-pulse dark:bg-emerald-500/20 dark:text-emerald-200">
            Your Turn
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.3em] text-slate-700 dark:border-slate-600 dark:text-slate-200">
          {game?.room_code || '------'}
        </div>
        <button
          type="button"
          onClick={onPass}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
        >
          Pass
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className={`h-2 w-2 rounded-full ${COLOR_STYLES[player.color]}`} />
            <span>{player.player_name || player.color}</span>
            {player.is_ai ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-slate-800">
                AI
              </span>
            ) : null}
            {player.has_passed ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-slate-800">
                Passed
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
