import { useMemo, useState } from 'react';
import { flipCoordsH, flipCoordsV, isValidPlacement, rotateCoords } from '../utils/validation';

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  green: 'bg-emerald-500'
};

const PREVIEW_FILL_CLASSES = {
  blue: 'bg-blue-400/80 shadow-[0_1px_2px_rgba(15,23,42,0.2)]',
  yellow: 'bg-amber-300/80 shadow-[0_1px_2px_rgba(15,23,42,0.2)]',
  red: 'bg-red-400/80 shadow-[0_1px_2px_rgba(15,23,42,0.2)]',
  green: 'bg-emerald-400/80 shadow-[0_1px_2px_rgba(15,23,42,0.2)]'
};

const PENDING_FILL_CLASSES = {
  blue: 'bg-blue-500/90 shadow-[0_2px_4px_rgba(15,23,42,0.25)]',
  yellow: 'bg-amber-400/90 shadow-[0_2px_4px_rgba(15,23,42,0.25)]',
  red: 'bg-red-500/90 shadow-[0_2px_4px_rgba(15,23,42,0.25)]',
  green: 'bg-emerald-500/90 shadow-[0_2px_4px_rgba(15,23,42,0.25)]'
};

const PREVIEW_BORDER_CLASSES = {
  blue: 'border-blue-300/60',
  yellow: 'border-amber-300/60',
  red: 'border-red-300/60',
  green: 'border-emerald-300/60'
};

const PENDING_BORDER_CLASSES = {
  blue: 'border-blue-500/60',
  yellow: 'border-amber-400/60',
  red: 'border-red-500/60',
  green: 'border-emerald-500/60'
};

const PREVIEW_SHADOW_CLASSES = {
  blue: 'shadow-[inset_0_0_0_2px_rgba(59,130,246,0.45)]',
  yellow: 'shadow-[inset_0_0_0_2px_rgba(251,191,36,0.45)]',
  red: 'shadow-[inset_0_0_0_2px_rgba(239,68,68,0.45)]',
  green: 'shadow-[inset_0_0_0_2px_rgba(16,185,129,0.45)]'
};

const PENDING_SHADOW_CLASSES = {
  blue: 'shadow-[inset_0_0_0_2px_rgba(59,130,246,0.65)]',
  yellow: 'shadow-[inset_0_0_0_2px_rgba(251,191,36,0.65)]',
  red: 'shadow-[inset_0_0_0_2px_rgba(239,68,68,0.65)]',
  green: 'shadow-[inset_0_0_0_2px_rgba(16,185,129,0.65)]'
};

const INVALID_SHADOW = 'shadow-[inset_0_0_0_2px_rgba(239,68,68,0.7)]';

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
  pendingPlacement,
  lastMovePositions,
  compact,
  isInteractive = true,
  onDropPlacement,
  onClearPending
}) {
  const [hoverCell, setHoverCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const transformedCoords = useMemo(
    () => getTransformedCoords(piece, transform),
    [piece, transform]
  );

  const previewCells = useMemo(() => {
    if (!hoverCell || !piece || !isInteractive) return [];
    if (pendingPlacement?.length && !isDragging) return [];
    return transformedCoords.map(([x, y]) => ({
      x: x + hoverCell.x,
      y: y + hoverCell.y
    }));
  }, [hoverCell, piece, transformedCoords, pendingPlacement, isDragging, isInteractive]);

  const isPlacementValid = useMemo(() => {
    if (!piece || !hoverCell || !isInteractive) return false;
    return isValidPlacement(
      grid,
      { ...piece, coords: transformedCoords },
      hoverCell,
      playerColor,
      isFirstMove
    );
  }, [grid, piece, transformedCoords, hoverCell, playerColor, isFirstMove]);

  const pendingSet = useMemo(() => {
    const set = new Set();
    (pendingPlacement || []).forEach(({ x, y }) => set.add(`${x},${y}`));
    return set;
  }, [pendingPlacement]);

  const lastMoveSet = useMemo(() => {
    const set = new Set();
    (lastMovePositions || []).forEach((pos) => {
      if (!pos) return;
      const x = Array.isArray(pos) ? pos[0] : pos.x;
      const y = Array.isArray(pos) ? pos[1] : pos.y;
      if (typeof x === 'number' && typeof y === 'number') {
        set.add(`${x},${y}`);
      }
    });
    return set;
  }, [lastMovePositions]);

  const handlePointerDown = (x, y) => {
    if (!piece || !isInteractive) return;
    if (onClearPending) onClearPending();
    setIsDragging(true);
    setHoverCell({ x, y });
  };

  const handlePointerEnter = (x, y) => {
    if (isDragging && isInteractive) {
      setHoverCell({ x, y });
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || !isInteractive) return;
    setIsDragging(false);
    if (!piece || !hoverCell) return;
    if (!isPlacementValid) return;
    onDropPlacement(previewCells);
  };

  return (
    <div
      className="select-none overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-white/90 via-white/70 to-slate-50/80 p-4 shadow-lg dark:border-slate-700 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-800/60"
      onMouseLeave={() => {
        setHoverCell(null);
        setIsDragging(false);
      }}
      onMouseUp={handlePointerUp}
    >
      <div
        className="board-grid grid"
        style={compact ? { '--cell-size': '24px' } : undefined}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const previewCell = previewCells.find((pos) => pos.x === x && pos.y === y);
            const hasPreview = Boolean(previewCell);
            const previewClass = hasPreview
              ? isPlacementValid
                ? PREVIEW_SHADOW_CLASSES[playerColor] || ''
                : `${INVALID_SHADOW} shake`
              : '';
            const previewFill =
              hasPreview && !cell
                ? PREVIEW_FILL_CLASSES[playerColor] || 'bg-slate-200/70'
                : '';
            const isPending = pendingSet.has(`${x},${y}`);
            const pendingFill =
              isPending && !cell
                ? PENDING_FILL_CLASSES[playerColor] || 'bg-slate-200/80'
                : '';
            const pendingClass = isPending ? PENDING_SHADOW_CLASSES[playerColor] || '' : '';
            const isLastMove = lastMoveSet.has(`${x},${y}`);
            const previewActive = hasPreview || isPending;
            const borderClass = isPending
              ? PENDING_BORDER_CLASSES[playerColor] || 'border-slate-200'
              : hasPreview && !isPlacementValid
              ? 'border-red-400/60'
              : hasPreview
              ? PREVIEW_BORDER_CLASSES[playerColor] || 'border-slate-200'
              : 'border-slate-100 dark:border-slate-800';
            const isCorner =
              (x === 0 && y === 0) ||
              (x === 19 && y === 0) ||
              (x === 19 && y === 19) ||
              (x === 0 && y === 19);

            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onMouseEnter={() => {
                  if (!isInteractive) return;
                  setHoverCell({ x, y });
                }}
                onPointerEnter={() => handlePointerEnter(x, y)}
                onPointerDown={() => handlePointerDown(x, y)}
                onPointerUp={handlePointerUp}
                onFocus={() => {
                  if (!isInteractive) return;
                  setHoverCell({ x, y });
                }}
                className={`preview-cell board-cell relative border ${borderClass} ${
                  cell ? COLOR_CLASSES[cell] : 'bg-white dark:bg-slate-900'
                } ${pendingFill} ${pendingClass} ${previewFill} ${previewClass} ${
                  isLastMove ? 'place-settle' : ''
                } ${previewActive ? 'preview-cell--active' : ''}`}
              >
                {isCorner && !cell ? (
                  <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
