export default function StartScreen({ onSelectMode }) {
  return (
    <div className="relative mx-auto mt-8 max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-sky-100 via-amber-100 to-emerald-100 p-10 shadow-xl dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/70 blur-2xl" />
      <div className="pointer-events-none absolute right-10 top-6 h-40 w-40 rounded-full bg-white/60 blur-2xl dark:bg-slate-700/60" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">
          Blokus
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">
          Blokus, by Chris
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-700 dark:text-slate-200">
          A modern multiplayer take on the classic strategy game. Play solo against
          AI or host a room for friends.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectMode('single')}
            className="group rounded-2xl border border-white/70 bg-white/80 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Solo</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Single Player</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Play against AI and test strategies.
            </p>
            <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
              Start Solo →
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('multi')}
            className="group rounded-2xl border border-white/70 bg-white/80 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Online</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Multiplayer</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Create a room, share a code, and play live.
            </p>
            <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
              Host Room →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
