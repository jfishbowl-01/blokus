import { PIECES, getPieceById } from '../utils/pieces';
import { flipCoordsH, flipCoordsV, rotateCoords } from '../utils/validation';

const COLOR_STYLES = {
  blue: 'border-blue-500/50 shadow-blue-400/30',
  yellow: 'border-amber-400/50 shadow-amber-300/30',
  red: 'border-red-500/50 shadow-red-400/30',
  green: 'border-emerald-500/50 shadow-emerald-400/30'
};

const PIECE_COLOR_CLASSES = {
  blue: 'bg-blue-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  green: 'bg-emerald-500'
};

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

const CELL_SIZE = 12;
const TILE_SIZE = 11;
const PREVIEW_SIZE = 72;

function PiecePreview({ piece, transform, selected, colorClass }) {
  const coords = getTransformedCoords(piece.coords, transform);
  const size = Math.max(...coords.map(([x, y]) => Math.max(x, y))) + 1;

  return (
    <div
      className={`relative grid place-items-center rounded-xl border border-transparent p-2 transition ${
        selected ? 'ring-2 ring-slate-900/20 shadow-md' : 'hover:ring-1 hover:ring-slate-200'
      }`}
      style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
    >
      <div
        className="relative"
        style={{ width: size * CELL_SIZE, height: size * CELL_SIZE }}
      >
        {coords.map(([x, y], index) => (
          <span
            key={`${piece.id}-${index}`}
            className={`absolute rounded-[3px] border border-white/20 ${colorClass} shadow-[0_1px_1px_rgba(15,23,42,0.25)]`}
            style={{
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE
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
  selectedPieceId,
  onSelectPiece,
  transform
}) {
  const remainingIds = new Set(player?.remaining_pieces || []);
  const pieceColorClass = PIECE_COLOR_CLASSES[player?.color] || 'bg-slate-700';
  const selectedName = getPieceById(selectedPieceId)?.name;

  return (
    <div
      className={`rounded-2xl border bg-white/80 p-4 transition ${
        player?.color ? `border-2 ${COLOR_STYLES[player.color]} shadow-lg` : 'border-slate-200'
      } ${isActive ? 'ring-2 ring-slate-900/20' : ''} dark:border-slate-700 dark:bg-slate-900/80`}
    >
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="uppercase tracking-[0.2em]">Pieces</span>
        {selectedName ? (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
            {selectedName}
          </span>
        ) : null}
      </div>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.95))] p-3 shadow-inner dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.95),rgba(15,23,42,0.95))]">
        <div className="grid grid-cols-4 gap-2">
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
                  colorClass={pieceColorClass}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
