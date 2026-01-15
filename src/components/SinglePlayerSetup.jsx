import { useState } from 'react';

const LEVELS = ['easy', 'medium', 'hard'];

export default function SinglePlayerSetup({ difficulty, onDifficultyChange, onStart, onBack }) {
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Single Player</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Choose a difficulty</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-600 dark:text-slate-200"
        >
          Back
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onDifficultyChange(level)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              difficulty === level
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'border border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={() => onStart(playerName)}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
