export function calculateScore(remainingPieces, allPiecesPlaced, lastPieceWasI1) {
  const remainingSquares = (remainingPieces || []).reduce(
    (total, piece) => total + (piece.squares || 0),
    0
  );

  if (!allPiecesPlaced) {
    return remainingSquares;
  }

  let score = remainingSquares - 15;
  if (lastPieceWasI1) {
    score -= 5;
  }

  return score;
}
