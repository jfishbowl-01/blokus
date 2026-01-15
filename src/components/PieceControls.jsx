export default function PieceControls({
  onConfirm,
  onUndo,
  showUndo,
  canConfirm,
  onRotateLeft,
  onRotateRight,
  onFlipH,
  onFlipV,
  compact = false,
  showTransformControls = true,
  showTransformToggle = false,
  onToggleTransformControls,
  showShortcutHint = false
}) {
  const primaryButtonClass = compact
    ? 'rounded-full bg-slate-900 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900'
    : 'rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900';
  const secondaryButtonClass = compact
    ? 'rounded-full border border-slate-300 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200'
    : 'rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200';
  const transformButtonClass = compact
    ? 'w-full rounded-xl border border-slate-300 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200'
    : 'w-full rounded-xl border border-slate-300 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200';

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`${primaryButtonClass} ${
            canConfirm ? 'pulse-soft' : ''
          }`}
        >
          Confirm Move
        </button>
        {showUndo ? (
          <button
            type="button"
            onClick={onUndo}
            className={secondaryButtonClass}
          >
            Undo
          </button>
        ) : null}
        {showTransformToggle ? (
          <button
            type="button"
            onClick={onToggleTransformControls}
            className={secondaryButtonClass}
          >
            {showTransformControls ? 'Hide Controls' : 'Controls'}
          </button>
        ) : null}
      </div>

      {showTransformControls ? (
        <div
          className={`mt-2 rounded-2xl border border-slate-200 bg-white/70 ${
            compact ? 'p-2' : 'p-3'
          } dark:border-slate-700 dark:bg-slate-900/60`}
        >
          <div
            className={`grid ${compact ? 'gap-2' : 'gap-3'} ${
              compact ? 'grid-cols-2' : 'grid-cols-2'
            }`}
          >
            <button type="button" onClick={onRotateLeft} className={transformButtonClass}>
              Rotate ⟲
            </button>
            <button type="button" onClick={onRotateRight} className={transformButtonClass}>
              Rotate ⟳
            </button>
            <button type="button" onClick={onFlipH} className={transformButtonClass}>
              Flip H
            </button>
            <button type="button" onClick={onFlipV} className={transformButtonClass}>
              Flip V
            </button>
          </div>
          {showShortcutHint ? (
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Shortcuts: Space / Shift+Space, F, V
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
