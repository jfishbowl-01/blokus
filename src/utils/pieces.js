export const PIECES = [
  { id: 1, name: 'I1', squares: 1, coords: [[0, 0]] },
  { id: 2, name: 'I2', squares: 2, coords: [[0, 0], [1, 0]] },
  { id: 3, name: 'I3', squares: 3, coords: [[0, 0], [1, 0], [2, 0]] },
  { id: 4, name: 'L3', squares: 3, coords: [[0, 0], [0, 1], [1, 0]] },
  { id: 5, name: 'I4', squares: 4, coords: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { id: 6, name: 'O4', squares: 4, coords: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { id: 7, name: 'T4', squares: 4, coords: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { id: 8, name: 'L4', squares: 4, coords: [[0, 0], [0, 1], [0, 2], [1, 0]] },
  { id: 9, name: 'Z4', squares: 4, coords: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { id: 10, name: 'I5', squares: 5, coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { id: 11, name: 'L5', squares: 5, coords: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0]] },
  { id: 12, name: 'T5', squares: 5, coords: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
  { id: 13, name: 'V5', squares: 5, coords: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]] },
  { id: 14, name: 'N5', squares: 5, coords: [[0, 1], [1, 1], [1, 0], [2, 0], [3, 0]] },
  { id: 15, name: 'Z5', squares: 5, coords: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { id: 16, name: 'P5', squares: 5, coords: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { id: 17, name: 'W5', squares: 5, coords: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { id: 18, name: 'U5', squares: 5, coords: [[0, 0], [0, 1], [1, 0], [2, 0], [2, 1]] },
  { id: 19, name: 'F5', squares: 5, coords: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { id: 20, name: 'X5', squares: 5, coords: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] },
  { id: 21, name: 'Y5', squares: 5, coords: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3]] }
];

export function getPieceById(id) {
  return PIECES.find((piece) => piece.id === id) || null;
}
