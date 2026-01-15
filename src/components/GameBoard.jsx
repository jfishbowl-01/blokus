import { useEffect, useMemo, useRef, useState } from 'react';
import {
  flipCoordsH,
  flipCoordsV,
  getStartingCorner,
  isValidPlacement,
  rotateCoords
} from '../utils/validation';
import { DEFAULT_DISPLAY_COLORS, hexToRgba, normalizeHexColor } from '../utils/colors.js';

const GRID_SIZE = 20;
const MIN_CELL_SIZE = 14;
const MAX_CELL_SIZE = 30;
const BOARD_PADDING = 32;

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
  playerDisplayColor,
  seatColorMap,
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
  const [activePointerId, setActivePointerId] = useState(null);
  const [cellSize, setCellSize] = useState(MAX_CELL_SIZE);
  const boardRef = useRef(null);
  const gridRef = useRef(null);
  const maxIndex = GRID_SIZE - 1;
  const activeDisplayColor =
    normalizeHexColor(playerDisplayColor) ||
    DEFAULT_DISPLAY_COLORS[playerColor] ||
    '#94A3B8';
  const startingCorner = isFirstMove ? getStartingCorner(playerColor) : null;

  const transformedCoords = useMemo(
    () => getTransformedCoords(piece, transform),
    [piece, transform]
  );

  useEffect(() => {
    const container = boardRef.current;
    if (!container) return;
    const padding = compact ? 20 : BOARD_PADDING;

    const updateSize = () => {
      const availableWidth = Math.max(0, container.clientWidth - padding);
      if (!availableWidth) return;
      const baseSize = Math.max(
        MIN_CELL_SIZE,
        Math.min(MAX_CELL_SIZE, Math.floor(availableWidth / GRID_SIZE))
      );
      const nextSize = compact ? Math.max(MIN_CELL_SIZE, baseSize - 4) : baseSize;
      setCellSize(nextSize);
    };

    updateSize();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [compact]);

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

  const resolveSeatColor = (seatColor) => {
    if (!seatColor) return null;
    const mapped =
      (seatColorMap && seatColorMap[seatColor]) || DEFAULT_DISPLAY_COLORS[seatColor];
    return normalizeHexColor(mapped) || '#94A3B8';
  };

  const getCellFromEvent = (event) => {
    const gridEl = gridRef.current;
    if (!gridEl) return null;
    const rect = gridEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const cellSizePx = rect.width / GRID_SIZE;
    const x = Math.floor((event.clientX - rect.left) / cellSizePx);
    const y = Math.floor((event.clientY - rect.top) / cellSizePx);
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
    return { x, y };
  };

  const handlePointerDown = (event) => {
    if (!piece || !isInteractive) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const nextCell = getCellFromEvent(event);
    if (!nextCell) return;
    event.preventDefault();
    if (onClearPending) onClearPending();
    setIsDragging(true);
    setHoverCell(nextCell);
    setActivePointerId(event.pointerId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isInteractive) return;
    const nextCell = getCellFromEvent(event);
    if (!nextCell) return;
    if (isDragging) {
      if (event.pointerId !== activePointerId) return;
      setHoverCell(nextCell);
      return;
    }
    if (event.pointerType === 'mouse') {
      setHoverCell(nextCell);
    }
  };

  const handlePointerUp = (event) => {
    if (!isDragging || !isInteractive) return;
    if (event.pointerId !== activePointerId) return;
    setIsDragging(false);
    setActivePointerId(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!piece) return;
    const dropCell = getCellFromEvent(event) || hoverCell;
    if (!dropCell) return;
    const canPlace = isValidPlacement(
      grid,
      { ...piece, coords: transformedCoords },
      dropCell,
      playerColor,
      isFirstMove
    );
    if (!canPlace) return;
    const dropCells = transformedCoords.map(([x, y]) => ({
      x: x + dropCell.x,
      y: y + dropCell.y
    }));
    onDropPlacement(dropCells);
  };

  const handlePointerCancel = (event) => {
    if (!isDragging) return;
    if (event.pointerId !== activePointerId) return;
    setIsDragging(false);
    setActivePointerId(null);
    setHoverCell(null);
  };

  const containerClass = compact
    ? 'select-none overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-white/90 via-white/70 to-slate-50/80 p-2 shadow-lg dark:border-slate-700 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-800/60'
    : 'select-none overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-br from-white/90 via-white/70 to-slate-50/80 p-4 shadow-lg dark:border-slate-700 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-800/60';

  return (
    <div
      ref={boardRef}
      className={containerClass}
      onMouseLeave={() => {
        if (!isDragging) {
          setHoverCell(null);
        }
      }}
    >
      <div
        ref={gridRef}
        className="board-grid grid touch-none"
        style={{ '--cell-size': `${cellSize}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const previewCell = previewCells.find((pos) => pos.x === x && pos.y === y);
            const hasPreview = Boolean(previewCell);
            const isPending = pendingSet.has(`${x},${y}`);
            const isLastMove = lastMoveSet.has(`${x},${y}`);
            const previewActive = hasPreview || isPending;
            const isInvalidPreview = hasPreview && !isPlacementValid;
            const previewClass = isInvalidPreview ? `${INVALID_SHADOW} shake` : '';
            const borderClass = isInvalidPreview
              ? 'border-red-400/60'
              : 'border-slate-100 dark:border-slate-800';
            const isCorner =
              (x === 0 && y === 0) ||
              (x === maxIndex && y === 0) ||
              (x === maxIndex && y === maxIndex) ||
              (x === 0 && y === maxIndex);
            const isStartingCorner =
              startingCorner && x === startingCorner.x && y === startingCorner.y;
            const highlightCorner =
              isStartingCorner && !cell && !isPending && !hasPreview && !isInvalidPreview;
            const cellDisplayColor = cell ? resolveSeatColor(cell) : null;
            const fillColor = !cell
              ? isPending
                ? hexToRgba(activeDisplayColor, 0.85)
                : hasPreview
                ? hexToRgba(activeDisplayColor, isPlacementValid ? 0.65 : 0.3)
                : null
              : null;
            const borderColor =
              isPending || (hasPreview && isPlacementValid)
                ? hexToRgba(activeDisplayColor, isPending ? 0.6 : 0.45)
                : null;
            const shadowStyle = isPending
              ? `0 2px 4px rgba(15,23,42,0.25), inset 0 0 0 2px ${hexToRgba(
                  activeDisplayColor,
                  0.6
                )}`
              : hasPreview && isPlacementValid
              ? `0 1px 2px rgba(15,23,42,0.2), inset 0 0 0 2px ${hexToRgba(
                  activeDisplayColor,
                  0.45
                )}`
              : undefined;
            const highlightShadow = highlightCorner
              ? `0 0 0 2px ${hexToRgba(activeDisplayColor, 0.7)}, 0 0 12px ${hexToRgba(
                  activeDisplayColor,
                  0.35
                )}`
              : null;
            const combinedShadow = shadowStyle && highlightShadow
              ? `${shadowStyle}, ${highlightShadow}`
              : shadowStyle || highlightShadow || undefined;
            const cornerBorderColor = highlightCorner
              ? hexToRgba(activeDisplayColor, 0.7)
              : null;
            const cellStyle = {
              backgroundColor: cellDisplayColor || fillColor || undefined,
              borderColor: borderColor || cornerBorderColor || undefined,
              boxShadow: combinedShadow
            };

            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onMouseEnter={() => {
                  if (!isInteractive) return;
                  setHoverCell({ x, y });
                }}
                onFocus={() => {
                  if (!isInteractive) return;
                  setHoverCell({ x, y });
                }}
                className={`preview-cell board-cell relative border ${borderClass} ${
                  cell ? '' : 'bg-white dark:bg-slate-900'
                } ${previewClass} ${isLastMove ? 'place-settle' : ''} ${
                  previewActive ? 'preview-cell--active' : ''
                }`}
                style={cellStyle}
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
