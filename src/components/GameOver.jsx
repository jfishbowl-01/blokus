import { hexToRgba, resolveDisplayColor } from '../utils/colors.js';

function getRankLabel(index) {
  if (index === 0) return '1st';
  if (index === 1) return '2nd';
  if (index === 2) return '3rd';
  return '4th';
}

function TrophyIcon({ color }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill={color}
        d="M7 4h10v2h3a4 4 0 0 1-4 4h-1a5 5 0 0 1-3 3v2h3v2H9v-2h3v-2a5 5 0 0 1-3-3H8a4 4 0 0 1-4-4h3V4z"
      />
    </svg>
  );
}

export default function GameOver({ placements, onNewGame }) {
  const winner = placements[0];
  const podiumOrder = [1, 0, 2, 3];
  const podiumHeights = [96, 132, 84, 72];

  return (
    <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
      <div className="fireworks">
        <span className="firework firework-blue" style={{ left: '12%', top: '12%' }} />
        <span className="firework firework-amber" style={{ right: '18%', top: '18%' }} />
        <span className="firework firework-emerald" style={{ left: '70%', top: '28%' }} />
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
          Game Over
        </p>
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
          {winner?.player.player_name || winner?.player.color || 'Winner'} wins!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A full board and a clean finish.
        </p>
      </div>

      <div className="mt-8">
        <div className="grid items-end gap-3 sm:grid-cols-4">
          {podiumOrder.map((slotIndex, columnIndex) => {
            const placement = placements[slotIndex];
            if (!placement) return null;
            const displayColor = resolveDisplayColor(placement.player);
            const isTopThree = slotIndex < 3;
            const height = podiumHeights[columnIndex] || 72;
            return (
              <div key={placement.player.id} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {isTopThree ? <TrophyIcon color={displayColor} /> : null}
                  {getRankLabel(slotIndex)}
                </div>
                <div
                  className="flex w-full items-end justify-center rounded-2xl border px-3 pb-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                  style={{
                    height: `${height}px`,
                    borderColor: hexToRgba(displayColor, 0.5),
                    backgroundColor: hexToRgba(displayColor, 0.18)
                  }}
                >
                  <span className="mb-2">
                    {placement.player.player_name || placement.player.color}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onNewGame}
        className="mt-8 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
      >
        New Game
      </button>
    </div>
  );
}
