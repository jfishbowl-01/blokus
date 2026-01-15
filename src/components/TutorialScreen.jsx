const COPY = {
  single: {
    kicker: 'Single Player',
    title: 'Quick Start',
    description: 'Play against AI and practice openings before you jump online.',
    steps: [
      'Choose a difficulty and pick your display color.',
      'Drag a piece onto the board to preview placement.',
      'Use Controls to rotate/flip, then Confirm to place.',
      'Pass if you cannot move; the game ends when everyone passes.'
    ]
  },
  multi: {
    kicker: 'Multiplayer',
    title: 'Room Basics',
    description: 'Create a room, share the invite, and play live with friends.',
    steps: [
      'Create a room and copy the invite link.',
      'Pick a display color and join with your name.',
      'Start once four players are ready (or fill with AI).',
      'Turns rotate in order; confirm placements to advance.'
    ]
  }
};

export default function TutorialScreen({ mode = 'single', onContinue, onBack }) {
  const content = COPY[mode] || COPY.single;

  return (
    <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            {content.kicker}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {content.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {content.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-600 dark:text-slate-200"
        >
          Back
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {content.steps.map((step, index) => (
          <div
            key={step}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-300">
              {index + 1}
            </span>
            <p>{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
        >
          Continue
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Tip: Space rotates, F/V flips, Enter confirms.
        </p>
      </div>
    </div>
  );
}
