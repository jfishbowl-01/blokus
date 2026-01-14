import { PIECES, getPieceById } from '../utils/pieces';
import { flipCoordsH, flipCoordsV, rotateCoords } from '../utils/validation';

const COLOR_STYLES = {
  blue: 'border-blue-500/50 shadow-blue-400/30',
  yellow: 'border-amber-400/50 shadow-amber-300/30',
  red: 'border-red-500/50 shadow-red-400/30',
  green: 'border-emerald-500/50 shadow-emerald-400/30'
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

function PiecePreview({ piece, transform, selected }) {
  const coords = getTransformedCoords(piece.coords, transform);
  const size = Math.max(...coords.map(([x, y]) => Math.max(x, y))) + 1;

  return (
    <div
      className={`relative grid place-items-center rounded-xl border border-slate-200 bg-white p-2 transition ${
        selected ? 'border-slate-400 shadow-md' : 'hover:border-slate-300'
      }`}
      style={{ width: 64, height: 64 }}
    >
      <div
        className="relative"
        style={{ width: size * 10, height: size * 10 }}
      >
        {coords.map(([x, y], index) => (
          <span
            key={`${piece.id}-${index}`}
            className="absolute rounded-sm bg-slate-800"
            style={{
              left: x * 10,
              top: y * 10,
              width: 9,
              height: 9
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

  return (
    <div
      className={`rounded-2xl border bg-white/80 p-4 transition ${
        player?.color ? `border-2 ${COLOR_STYLES[player.color]} shadow-lg` : 'border-slate-200'
      } ${isActive ? 'ring-2 ring-slate-900/20' : ''}`}
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Your Pieces
      </h3>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {PIECES.map((piece) => {
          const isAvailable = remainingIds.has(piece.id);
          return (
            <button
              key={piece.id}
              type="button"
              onClick={() => onSelectPiece(piece.id)}
              disabled={!isAvailable}
              className={`transition ${isAvailable ? 'opacity-100' : 'opacity-30'}`}
            >
              <PiecePreview
                piece={piece}
                transform={transform}
                selected={selectedPieceId === piece.id}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Selected: {getPieceById(selectedPieceId)?.name || 'None'}
      </p>
    </div>
  );
}
