const PLAYER_ACCENTS = {
  blue: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100',
  yellow: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  red: 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100'
};

function getRankLabel(index) {
  if (index === 0) return '1st';
  if (index === 1) return '2nd';
  if (index === 2) return '3rd';
  return '4th';
}

export default function GameOver({ placements, onNewGame }) {
  const winner = placements[0];

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

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {placements.map((placement, index) => (
          <div
            key={placement.player.id}
            className={`rounded-2xl border px-5 py-4 text-sm shadow-sm ${
              PLAYER_ACCENTS[placement.player.color] ||
              'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
            } ${index === 0 ? 'md:row-span-2 md:self-center' : ''}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {getRankLabel(index)}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {placement.player.player_name || placement.player.color}
            </p>
          </div>
        ))}
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
