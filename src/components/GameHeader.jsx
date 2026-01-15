import { resolveDisplayColor } from '../utils/colors.js';

export default function GameHeader({
  game,
  players,
  currentTurn,
  isPlayerTurn,
  currentPlayerId,
  onPass,
  onLeave,
  compact = false
}) {
  const currentAccent = resolveDisplayColor(currentTurn);
  const containerClass = compact
    ? 'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none'
    : 'flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none';
  const labelClass = compact
    ? 'text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400'
    : 'text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400';
  const nameClass = compact
    ? 'text-xs font-semibold text-slate-900 dark:text-slate-100'
    : 'text-sm font-semibold text-slate-900 dark:text-slate-100';
  const roomCodeClass = compact
    ? 'rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-[10px] font-semibold tracking-[0.3em] text-slate-700 dark:border-slate-600 dark:text-slate-200'
    : 'rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.3em] text-slate-700 dark:border-slate-600 dark:text-slate-200';
  const buttonClass = compact
    ? 'rounded-full border border-slate-300 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200'
    : 'rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200';
  const leaveButtonClass = compact
    ? 'rounded-full border border-rose-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 transition hover:border-rose-300 dark:border-rose-500/40 dark:text-rose-200'
    : 'rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 transition hover:border-rose-300 dark:border-rose-500/40 dark:text-rose-200';
  const playerPillClass = compact
    ? 'flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] text-slate-600 dark:text-slate-200'
    : 'flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-slate-600 dark:text-slate-200';
  const badgeClass = compact
    ? 'rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase dark:bg-slate-800'
    : 'rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-slate-800';
  const activeBadgeClass = compact
    ? 'rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
    : 'rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: currentAccent }}
        />
        <div>
          <p className={labelClass}>Current Turn</p>
          <p className={nameClass}>{currentTurn?.player_name || currentTurn?.color || 'Waiting...'}</p>
        </div>
        {isPlayerTurn ? (
          <span className={`${activeBadgeClass} ml-2 turn-pulse`}>
            Your Turn
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className={roomCodeClass}>{game?.room_code || '------'}</div>
        <button
          type="button"
          onClick={onPass}
          className={buttonClass}
        >
          Pass
        </button>
        {onLeave ? (
          <button
            type="button"
            onClick={onLeave}
            className={leaveButtonClass}
          >
            Leave
          </button>
        ) : null}
      </div>

      <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-2'}`}>
        {players.map((player) => {
          const isActive = currentTurn?.id === player.id;
          const isYou = currentPlayerId === player.id;
          return (
            <div
              key={player.id}
              className={`${playerPillClass} ${
                isActive
                  ? 'border-slate-400 bg-slate-50 font-semibold shadow-sm dark:border-slate-500 dark:bg-slate-800'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/80'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: resolveDisplayColor(player) }}
              />
              <span>{player.player_name || player.color}</span>
              {isYou ? (
                <span className={badgeClass}>You</span>
              ) : null}
              {isActive ? (
                <span className={activeBadgeClass}>Active</span>
              ) : null}
              {player.is_ai ? (
                <span className={badgeClass}>AI</span>
              ) : null}
              {player.has_passed ? (
                <span className={badgeClass}>Passed</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
