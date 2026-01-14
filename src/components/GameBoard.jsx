import { useMemo, useState } from 'react';
import { flipCoordsH, flipCoordsV, isValidPlacement, rotateCoords } from '../utils/validation';

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  green: 'bg-emerald-500'
};

function getTransformedCoords(piece, transform) {
  if (!piece) return [];
  let coords = piece.coords.map((coord) => [...coord]);
  if (transform.flipH) coords = flipCoordsH(coords);
  if (transform.flipV) coords = flipCoordsV(coords);
  if (transform.rotation) coords = rotateCoords(coords, transform.rotation);
  return coords;
}

export default function GameBoard({
  grid,
  piece,
  transform,
  playerColor,
  isFirstMove,
  onPlace
}) {
  const [hoverCell, setHoverCell] = useState(null);

  const transformedCoords = useMemo(
    () => getTransformedCoords(piece, transform),
    [piece, transform]
  );

  const previewCells = useMemo(() => {
    if (!hoverCell || !piece) return [];
    return transformedCoords.map(([x, y]) => ({
      x: x + hoverCell.x,
      y: y + hoverCell.y
    }));
  }, [hoverCell, piece, transformedCoords]);

  const isPlacementValid = useMemo(() => {
    if (!piece || !hoverCell) return false;
    return isValidPlacement(
      grid,
      { ...piece, coords: transformedCoords },
      hoverCell,
      playerColor,
      isFirstMove
    );
  }, [grid, piece, transformedCoords, hoverCell, playerColor, isFirstMove]);

  const handleClick = () => {
    if (!piece || !hoverCell) return;
    if (!isPlacementValid) return;
    onPlace(previewCells);
  };

  return (
    <div
      className="overflow-auto rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg"
      onMouseLeave={() => setHoverCell(null)}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(20, 30px)',
          gridTemplateRows: 'repeat(20, 30px)'
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const previewCell = previewCells.find((pos) => pos.x === x && pos.y === y);
            const hasPreview = Boolean(previewCell);
            const previewClass = hasPreview
              ? isPlacementValid
                ? 'ring-2 ring-emerald-400'
                : 'ring-2 ring-red-500 shake'
              : '';
            const isCorner =
              (x === 0 && y === 0) ||
              (x === 19 && y === 0) ||
              (x === 19 && y === 19) ||
              (x === 0 && y === 19);

            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onMouseEnter={() => setHoverCell({ x, y })}
                onFocus={() => setHoverCell({ x, y })}
                onClick={handleClick}
                className={`relative h-[30px] w-[30px] border border-slate-200 ${
                  cell ? COLOR_CLASSES[cell] : 'bg-white'
                } ${previewClass}`}
              >
                {isCorner && !cell ? (
                  <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-slate-300" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
