export default function PieceControls({ onRotateCW, onRotateCCW, onFlipH, onFlipV, onReset }) {
  const buttonClass =
    'rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400';

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onRotateCCW} className={buttonClass}>
        Rotate CCW
      </button>
      <button type="button" onClick={onRotateCW} className={buttonClass}>
        Rotate CW
      </button>
      <button type="button" onClick={onFlipH} className={buttonClass}>
        Flip H
      </button>
      <button type="button" onClick={onFlipV} className={buttonClass}>
        Flip V
      </button>
      <button type="button" onClick={onReset} className={buttonClass}>
        Reset
      </button>
    </div>
  );
}
