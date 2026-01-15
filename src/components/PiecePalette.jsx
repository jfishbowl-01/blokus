import { PIECES, getPieceById } from '../utils/pieces';
import { flipCoordsH, flipCoordsV, rotateCoords } from '../utils/validation';
import { hexToRgba, resolveDisplayColor } from '../utils/colors.js';

function getTransformedCoords(coords, transform) {
  let nextCoords = coords.map((coord) => [...coord]);
  if (transform.flipH) {
    nextCoords = flipCoordsH(nextCoords);
  }
  if (transform.flipV) {
    nextCoords = flipCoordsV(nextCoords);
  }
  if (transform.rotation) {
    nextCoords = rotateCoords(nextCoords, transform.rotation);
  }
  return nextCoords;
}

const PREVIEW_SIZES = {
  regular: { cell: 12, tile: 11, preview: 72 },
  compact: { cell: 9, tile: 8, preview: 52 }
};

function PiecePreview({ piece, transform, selected, color, sizes }) {
  const coords = getTransformedCoords(piece.coords, transform);
  const size = Math.max(...coords.map(([x, y]) => Math.max(x, y))) + 1;

  return (
    <div
      className={`relative grid place-items-center rounded-xl border border-transparent p-2 transition ${
        selected ? 'ring-2 ring-slate-900/20 shadow-md' : 'hover:ring-1 hover:ring-slate-200'
      }`}
      style={{ width: sizes.preview, height: sizes.preview }}
    >
      <div
        className="relative"
        style={{ width: size * sizes.cell, height: size * sizes.cell }}
      >
        {coords.map(([x, y], index) => (
          <span
            key={`${piece.id}-${index}`}
            className="absolute rounded-[3px] border border-white/20 shadow-[0_1px_1px_rgba(15,23,42,0.25)]"
            style={{
              left: x * sizes.cell,
              top: y * sizes.cell,
              width: sizes.tile,
              height: sizes.tile,
              backgroundColor: color
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PiecePalette({
  player,
  isActive,
  isDisabled,
  selectedPieceId,
  onSelectPiece,
  transform,
  compact = false
}) {
  const remainingIds = new Set(player?.remaining_pieces || []);
  const displayColor = resolveDisplayColor(player);
  const selectedName = getPieceById(selectedPieceId)?.name;
  const sizes = compact ? PREVIEW_SIZES.compact : PREVIEW_SIZES.regular;
  const gridClass = compact ? 'grid grid-cols-4 gap-2 sm:grid-cols-5' : 'grid grid-cols-3 gap-2 sm:grid-cols-4';
  const borderColor = hexToRgba(displayColor, 0.55);
  const shadowColor = hexToRgba(displayColor, 0.25);

  return (
    <div
      className={`rounded-2xl border bg-white/80 transition ${
        player?.color ? 'border-2 shadow-lg' : 'border-slate-200'
      } ${isActive ? 'ring-2 ring-slate-900/20' : ''} ${
        isDisabled ? 'pointer-events-none opacity-60' : ''
      } ${compact ? 'p-3' : 'p-4'} dark:border-slate-700 dark:bg-slate-900/80`}
      style={player?.color ? { borderColor, boxShadow: `0 16px 30px ${shadowColor}` } : undefined}
    >
      <div
        className={`flex items-center justify-between text-slate-500 dark:text-slate-400 ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}
      >
        <span className="uppercase tracking-[0.2em]">Pieces</span>
        {selectedName ? (
          <span
            className={`rounded-full border border-slate-200 bg-white font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
            }`}
          >
            {selectedName}
          </span>
        ) : null}
      </div>
      <div
        className={`mt-3 rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.95))] shadow-inner dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.95),rgba(15,23,42,0.95))] ${
          compact ? 'p-2' : 'p-3'
        }`}
      >
        <div className={gridClass}>
          {PIECES.map((piece) => {
            const isAvailable = remainingIds.has(piece.id);
            return (
              <button
                key={piece.id}
                type="button"
                onClick={() => onSelectPiece(piece.id)}
                disabled={!isAvailable}
                className={`transition ${
                  isAvailable ? 'opacity-100 hover:-translate-y-0.5' : 'opacity-30'
                }`}
              >
                <PiecePreview
                  piece={piece}
                  transform={transform}
                  selected={selectedPieceId === piece.id}
                  color={displayColor}
                  sizes={sizes}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
