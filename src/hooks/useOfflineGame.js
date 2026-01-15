import { useCallback, useMemo, useState } from 'react';
import { PIECES } from '../utils/pieces';
import {
  DEFAULT_DISPLAY_COLORS,
  DISPLAY_COLOR_OPTIONS,
  getUniqueDisplayColor,
  normalizeHexColor,
  resolveDisplayColor
} from '../utils/colors.js';
import { getAiNames } from '../utils/aiNames.js';

const COLORS = ['blue', 'yellow', 'red', 'green'];

function getAllPieceIds() {
  return PIECES.map((piece) => piece.id);
}

function createLocalGame() {
  return {
    id: 'local-game',
    room_code: 'LOCAL',
    status: 'waiting',
    current_player_index: 0
  };
}

export function useOfflineGame() {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [moves, setMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    const nextGame = createLocalGame();
    setGame(nextGame);
    setPlayers([]);
    setMoves([]);
    setCurrentPlayer(null);
    setLoading(false);
    return nextGame;
  }, []);

  const startSinglePlayer = useCallback(async (playerName, displayColor) => {
    setLoading(true);
    setError(null);

    const normalizedDisplayColor = normalizeHexColor(displayColor);
    const isAllowedColor = normalizedDisplayColor
      ? DISPLAY_COLOR_OPTIONS.includes(normalizedDisplayColor)
      : false;
    const resolvedDisplayColor =
      isAllowedColor && normalizedDisplayColor
        ? normalizedDisplayColor
        : DEFAULT_DISPLAY_COLORS.blue;
    const resolvedPlayerName = playerName || 'You';
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    const nextGame = { ...createLocalGame(), status: 'active', current_player_index: randomIndex };
    const takenColors = new Set([resolvedDisplayColor]);
    const aiNames = getAiNames(COLORS.length - 1, new Set([resolvedPlayerName]));
    const nextPlayers = COLORS.map((color, index) => {
      const displayColor =
        index === 0
          ? resolvedDisplayColor
          : getUniqueDisplayColor(DEFAULT_DISPLAY_COLORS[color], takenColors);
      takenColors.add(displayColor);
      return {
        id: `local-player-${index}`,
        game_id: nextGame.id,
        color,
        player_name: index === 0 ? resolvedPlayerName : aiNames[index - 1],
        has_passed: false,
        remaining_pieces: getAllPieceIds(),
        join_order: index,
        is_ai: index !== 0,
        display_color: displayColor
      };
    });

    setGame(nextGame);
    setPlayers(nextPlayers);
    setMoves([]);
    setCurrentPlayer(nextPlayers[0]);
    setLoading(false);
    return nextGame;
  }, []);

  const joinGame = useCallback(async (_roomCode, playerName, displayColor) => {
    setLoading(true);
    setError(null);

    const joinOrder = players.length;
    if (joinOrder >= COLORS.length) {
      setLoading(false);
      setError(new Error('Game is full'));
      return null;
    }

    const normalizedDisplayColor = normalizeHexColor(displayColor);
    const isAllowedColor = normalizedDisplayColor
      ? DISPLAY_COLOR_OPTIONS.includes(normalizedDisplayColor)
      : false;
    if (!isAllowedColor) {
      setLoading(false);
      setError(new Error('Pick a color from the palette'));
      return null;
    }
    const resolvedDisplayColor = normalizedDisplayColor;
    const isColorTaken = players.some(
      (entry) => resolveDisplayColor(entry) === resolvedDisplayColor
    );
    if (isColorTaken) {
      setLoading(false);
      setError(new Error('Color already taken'));
      return null;
    }

    const player = {
      id: `local-player-${joinOrder}`,
      game_id: game?.id || 'local-game',
      color: COLORS[joinOrder],
      player_name: playerName || COLORS[joinOrder],
      has_passed: false,
      remaining_pieces: getAllPieceIds(),
      join_order: joinOrder,
      display_color: resolvedDisplayColor
    };

    const nextPlayers = [...players, player];
    setPlayers(nextPlayers);
    setCurrentPlayer(player);
    setLoading(false);
    return player;
  }, [players, game?.id]);

  const placePiece = useCallback(
    async (pieceId, gridPositions) => {
      if (!game || !currentPlayer) {
        setError(new Error('Missing game or player context'));
        return null;
      }

      const move = {
        id: `move-${Date.now()}`,
        game_id: game.id,
        player_id: currentPlayer.id,
        piece_id: pieceId,
        grid_positions: gridPositions,
        placed_at: new Date().toISOString()
      };

      const updatedRemaining = (currentPlayer.remaining_pieces || []).filter(
        (id) => id !== pieceId
      );

      const updatedPlayer = {
        ...currentPlayer,
        remaining_pieces: updatedRemaining
      };

      setMoves((prev) => [...prev, move]);
      setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      setCurrentPlayer(updatedPlayer);
      return move;
    },
    [game, currentPlayer]
  );

  const passTurn = useCallback(async () => {
    if (!game || !currentPlayer) {
      setError(new Error('Missing game or player context'));
      return null;
    }

    const updatedPlayer = { ...currentPlayer, has_passed: true };
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    setCurrentPlayer(updatedPlayer);
    return updatedPlayer;
  }, [game, currentPlayer]);

  const subscribeToGame = useCallback(() => () => {}, []);
  const fetchGameData = useCallback(() => {}, []);

  const playersById = useMemo(() => {
    const map = new Map();
    players.forEach((player) => map.set(player.id, player));
    return map;
  }, [players]);

  return {
    game,
    players,
    moves,
    currentPlayer,
    loading,
    error,
    setGame,
    setPlayers,
    setMoves,
    setCurrentPlayer,
    createGame,
    startSinglePlayer,
    joinGame,
    placePiece,
    passTurn,
    fetchGameData,
    subscribeToGame,
    playersById
  };
}
