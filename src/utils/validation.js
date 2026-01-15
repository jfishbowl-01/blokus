const GRID_SIZE = 20;

const STARTING_CORNERS = {
  blue: { x: 0, y: 0 },
  yellow: { x: GRID_SIZE - 1, y: 0 },
  red: { x: GRID_SIZE - 1, y: GRID_SIZE - 1 },
  green: { x: 0, y: GRID_SIZE - 1 }
};

export function getStartingCorner(color) {
  return STARTING_CORNERS[color] || null;
}

function normalizeCoords(coords) {
  const minX = Math.min(...coords.map((c) => c[0]));
  const minY = Math.min(...coords.map((c) => c[1]));
  return coords.map(([x, y]) => [x - minX, y - minY]);
}

export function rotateCoords(coords, degrees) {
  const turns = ((degrees % 360) + 360) % 360;
  if (turns === 0) {
    return normalizeCoords(coords);
  }

  let rotated = coords.map(([x, y]) => [x, y]);
  const steps = turns / 90;
  for (let i = 0; i < steps; i += 1) {
    rotated = rotated.map(([x, y]) => [-y, x]);
  }

  return normalizeCoords(rotated);
}

export function flipCoordsH(coords) {
  const flipped = coords.map(([x, y]) => [-x, y]);
  return normalizeCoords(flipped);
}

export function flipCoordsV(coords) {
  const flipped = coords.map(([x, y]) => [x, -y]);
  return normalizeCoords(flipped);
}

export function getCornerNeighbors(coords) {
  const neighbors = new Set();
  coords.forEach(([x, y]) => {
    neighbors.add(`${x - 1},${y - 1}`);
    neighbors.add(`${x + 1},${y - 1}`);
    neighbors.add(`${x - 1},${y + 1}`);
    neighbors.add(`${x + 1},${y + 1}`);
  });
  return neighbors;
}

export function getEdgeNeighbors(coords) {
  const neighbors = new Set();
  coords.forEach(([x, y]) => {
    neighbors.add(`${x - 1},${y}`);
    neighbors.add(`${x + 1},${y}`);
    neighbors.add(`${x},${y - 1}`);
    neighbors.add(`${x},${y + 1}`);
  });
  return neighbors;
}

function isInsideGrid(x, y) {
  return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE;
}

export function isValidPlacement(grid, piece, position, playerColor, isFirstMove) {
  if (!grid || !piece || !position || !playerColor) {
    return false;
  }

  const { x: offsetX, y: offsetY } = position;
  const absoluteCoords = piece.coords.map(([x, y]) => [x + offsetX, y + offsetY]);

  for (const [x, y] of absoluteCoords) {
    if (!isInsideGrid(x, y)) {
      return false;
    }

    if (grid[y]?.[x]) {
      return false;
    }
  }

  const edgeNeighbors = getEdgeNeighbors(absoluteCoords);
  for (const neighbor of edgeNeighbors) {
    const [nx, ny] = neighbor.split(',').map(Number);
    if (isInsideGrid(nx, ny) && grid[ny]?.[nx] === playerColor) {
      return false;
    }
  }

  const cornerNeighbors = getCornerNeighbors(absoluteCoords);
  let touchesCorner = false;
  for (const neighbor of cornerNeighbors) {
    const [nx, ny] = neighbor.split(',').map(Number);
    if (isInsideGrid(nx, ny) && grid[ny]?.[nx] === playerColor) {
      touchesCorner = true;
      break;
    }
  }

  if (isFirstMove) {
    const startingCorner = STARTING_CORNERS[playerColor];
    if (!startingCorner) {
      return false;
    }

    const coversStart = absoluteCoords.some(
      ([x, y]) => x === startingCorner.x && y === startingCorner.y
    );

    return coversStart;
  }

  return touchesCorner;
}
