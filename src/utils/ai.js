import { getPieceById } from './pieces';
import { flipCoordsH, flipCoordsV, isValidPlacement, rotateCoords } from './validation';

const GRID_SIZE = 20;
const ROTATIONS = [0, 90, 180, 270];
const FLIPS = [
  { flipH: false, flipV: false },
  { flipH: true, flipV: false },
  { flipH: false, flipV: true },
  { flipH: true, flipV: true }
];

function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getUniqueTransforms(coords) {
  const seen = new Set();
  const transforms = [];

  ROTATIONS.forEach((rotation) => {
    FLIPS.forEach(({ flipH, flipV }) => {
      let nextCoords = coords.map((coord) => [...coord]);
      if (flipH) nextCoords = flipCoordsH(nextCoords);
      if (flipV) nextCoords = flipCoordsV(nextCoords);
      if (rotation) nextCoords = rotateCoords(nextCoords, rotation);

      const key = nextCoords
        .map(([x, y]) => `${x},${y}`)
        .sort()
        .join('|');

      if (!seen.has(key)) {
        seen.add(key);
        transforms.push(nextCoords);
      }
    });
  });

  return transforms;
}

function getAllPositions() {
  const positions = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      positions.push({ x, y });
    }
  }
  return positions;
}

function countOpenCorners(grid, gridPositions) {
  const occupied = new Set(gridPositions.map(({ x, y }) => `${x},${y}`));
  let count = 0;

  gridPositions.forEach(({ x, y }) => {
    const candidates = [
      [x - 1, y - 1],
      [x + 1, y - 1],
      [x - 1, y + 1],
      [x + 1, y + 1]
    ];

    candidates.forEach(([nx, ny]) => {
      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) return;
      if (occupied.has(`${nx},${ny}`)) return;
      if (!grid[ny]?.[nx]) {
        count += 1;
      }
    });
  });

  return count;
}

function centerScore(gridPositions) {
  const center = (GRID_SIZE - 1) / 2;
  const total = gridPositions.reduce((sum, { x, y }) => {
    return sum + Math.abs(x - center) + Math.abs(y - center);
  }, 0);
  const avg = total / gridPositions.length;
  return GRID_SIZE * 2 - avg;
}

function scoreMove({ grid, piece, gridPositions, difficulty }) {
  const sizeScore = piece.squares * 10;
  const cornerScore = countOpenCorners(grid, gridPositions);
  const centerBias = centerScore(gridPositions);

  if (difficulty === 'hard') {
    return sizeScore + cornerScore * 4 + centerBias * 1.5;
  }

  return sizeScore + cornerScore * 2;
}

export function findMoveForPlayer({
  grid,
  playerColor,
  remainingPieceIds,
  isFirstMove,
  difficulty = 'easy',
  randomize = true
}) {
  if (!grid || !playerColor || !remainingPieceIds?.length) {
    return null;
  }

  const pieces = remainingPieceIds
    .map((id) => getPieceById(id))
    .filter(Boolean);
  const shuffleOrder = randomize && (difficulty === 'easy' || difficulty === 'medium');
  const pieceOrder = shuffleOrder ? shuffle(pieces) : pieces;
  const positions = shuffleOrder ? shuffle(getAllPositions()) : getAllPositions();

  if (difficulty === 'easy') {
    for (const piece of pieceOrder) {
      const transforms = getUniqueTransforms(piece.coords);
      const transformOrder = shuffleOrder ? shuffle(transforms) : transforms;

      for (const coords of transformOrder) {
        const candidatePiece = { ...piece, coords };
        for (const position of positions) {
          if (!isValidPlacement(grid, candidatePiece, position, playerColor, isFirstMove)) {
            continue;
          }

          const gridPositions = coords.map(([x, y]) => ({
            x: x + position.x,
            y: y + position.y
          }));

          return { pieceId: piece.id, gridPositions };
        }
      }
    }

    return null;
  }

  let bestMove = null;
  let bestScore = -Infinity;

  for (const piece of pieceOrder) {
    const transforms = getUniqueTransforms(piece.coords);
    const transformOrder = shuffleOrder ? shuffle(transforms) : transforms;

    for (const coords of transformOrder) {
      const candidatePiece = { ...piece, coords };
      for (const position of positions) {
        if (!isValidPlacement(grid, candidatePiece, position, playerColor, isFirstMove)) {
          continue;
        }

        const gridPositions = coords.map(([x, y]) => ({
          x: x + position.x,
          y: y + position.y
        }));

        const score = scoreMove({
          grid,
          piece,
          gridPositions,
          difficulty
        });

        if (score > bestScore) {
          bestScore = score;
          bestMove = { pieceId: piece.id, gridPositions };
        } else if (score === bestScore && shuffleOrder && Math.random() > 0.5) {
          bestMove = { pieceId: piece.id, gridPositions };
        }
      }
    }
  }

  return bestMove;
}
