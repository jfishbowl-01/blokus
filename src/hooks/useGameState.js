import { useMemo, useState } from 'react';

const GRID_SIZE = 20;

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function normalizePosition(position) {
  if (Array.isArray(position)) {
    return { x: position[0], y: position[1] };
  }
  return position;
}

export function useGameState({ game, players, moves }) {
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [pieceTransform, setPieceTransform] = useState({
    rotation: 0,
    flipH: false,
    flipV: false
  });

  const playersSorted = useMemo(() => {
    return [...(players || [])].sort((a, b) => a.join_order - b.join_order);
  }, [players]);

  const currentTurn = useMemo(() => {
    if (!game || !playersSorted.length) return null;
    return playersSorted[game.current_player_index] || null;
  }, [game, playersSorted]);

  const grid = useMemo(() => {
    const nextGrid = createEmptyGrid();
    if (!moves || !playersSorted.length) {
      return nextGrid;
    }

    const playerColors = new Map(playersSorted.map((p) => [p.id, p.color]));

    moves.forEach((move) => {
      const color = playerColors.get(move.player_id);
      if (!color) return;

      const positions = Array.isArray(move.grid_positions) ? move.grid_positions : [];
      positions.forEach((pos) => {
        const { x, y } = normalizePosition(pos);
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          nextGrid[y][x] = color;
        }
      });
    });

    return nextGrid;
  }, [moves, playersSorted]);

  return {
    grid,
    players: playersSorted,
    currentTurn,
    selectedPiece,
    setSelectedPiece,
    pieceTransform,
    setPieceTransform
  };
}
