export default function PieceControls({
  onConfirm,
  onCancel,
  onUndo,
  showUndo,
  canConfirm
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm}
        className={`rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 ${
          canConfirm ? 'pulse-soft' : ''
        }`}
      >
        Confirm Move
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
      >
        Cancel
      </button>
      {showUndo ? (
        <button
          type="button"
          onClick={onUndo}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
        >
          Undo
        </button>
      ) : null}
    </div>
  );
}
