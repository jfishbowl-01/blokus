import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PIECES } from '../utils/pieces';

const COLORS = ['blue', 'yellow', 'red', 'green'];

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getAllPieceIds() {
  return PIECES.map((piece) => piece.id);
}

export function useSupabaseGame() {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [moves, setMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const playersById = useMemo(() => {
    const map = new Map();
    players.forEach((player) => map.set(player.id, player));
    return map;
  }, [players]);

  const fetchGameData = useCallback(async (gameId) => {
    if (!gameId) return;
    const [{ data: gameData, error: gameError }, { data: playersData, error: playersError }, { data: movesData, error: movesError }] = await Promise.all([
      supabase.from('games').select('*').eq('id', gameId).single(),
      supabase.from('players').select('*').eq('game_id', gameId).order('join_order'),
      supabase.from('moves').select('*').eq('game_id', gameId).order('placed_at')
    ]);

    if (gameError || playersError || movesError) {
      setError(gameError || playersError || movesError);
      return;
    }

    setGame(gameData);
    setPlayers(playersData || []);
    setMoves(movesData || []);
  }, []);

  const createGame = useCallback(async () => {
    setLoading(true);
    setError(null);

    let attempts = 0;
    let createdGame = null;
    while (!createdGame && attempts < 5) {
      const roomCode = generateRoomCode();
      const { data, error: insertError } = await supabase
        .from('games')
        .insert({ room_code: roomCode })
        .select('*')
        .single();

      if (!insertError) {
        createdGame = data;
      } else if (insertError.code !== '23505') {
        setError(insertError);
        break;
      }
      attempts += 1;
    }

    setLoading(false);
    if (createdGame) {
      setGame(createdGame);
      setPlayers([]);
      setMoves([]);
    }

    return createdGame;
  }, []);

  const addAiPlayers = useCallback(async (gameId) => {
    if (!gameId) return null;
    setLoading(true);
    setError(null);

    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('join_order');

    if (playersError) {
      setLoading(false);
      setError(playersError);
      return null;
    }

    const takenColors = new Set(playersData.map((player) => player.color));
    const takenOrders = new Set(playersData.map((player) => player.join_order));
    const availableColors = COLORS.filter((color) => !takenColors.has(color));
    const availableOrders = COLORS.map((_, index) => index).filter((index) => !takenOrders.has(index));

    if (!availableColors.length) {
      setLoading(false);
      return [];
    }

    const aiRows = availableColors.map((color, index) => ({
      game_id: gameId,
      player_name: `AI ${color[0].toUpperCase()}${color.slice(1)}`,
      color,
      join_order: availableOrders[index] ?? playersData.length + index,
      remaining_pieces: getAllPieceIds(),
      is_ai: true
    }));

    const { data: insertedPlayers, error: insertError } = await supabase
      .from('players')
      .insert(aiRows)
      .select('*');

    setLoading(false);

    if (insertError) {
      setError(insertError);
      return null;
    }

    const merged = [...playersData, ...(insertedPlayers || [])].sort(
      (a, b) => a.join_order - b.join_order
    );
    setPlayers(merged);
    return insertedPlayers || [];
  }, []);

  const joinGame = useCallback(async (roomCode, playerName) => {
    setLoading(true);
    setError(null);

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (gameError || !gameData) {
      setLoading(false);
      setError(gameError || new Error('Game not found'));
      return null;
    }

    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameData.id)
      .order('join_order');

    if (playersError) {
      setLoading(false);
      setError(playersError);
      return null;
    }

    const joinOrder = playersData.length;
    if (joinOrder >= COLORS.length) {
      setLoading(false);
      setError(new Error('Game is full'));
      return null;
    }

    const color = COLORS[joinOrder];
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: gameData.id,
        player_name: playerName,
        color,
        join_order: joinOrder,
        remaining_pieces: getAllPieceIds(),
        is_ai: false
      })
      .select('*')
      .single();

    setLoading(false);

    if (playerError) {
      setError(playerError);
      return null;
    }

    setGame(gameData);
    setPlayers([...playersData, playerData]);
    setCurrentPlayer(playerData);
    return playerData;
  }, []);

  const placePieceForPlayer = useCallback(
    async (playerId, pieceId, gridPositions) => {
      if (!game || !playerId) {
        setError(new Error('Missing game or player context'));
        return null;
      }

      const { data: moveData, error: moveError } = await supabase
        .from('moves')
        .insert({
          game_id: game.id,
          player_id: playerId,
          piece_id: pieceId,
          grid_positions: gridPositions
        })
        .select('*')
        .single();

      if (moveError) {
        setError(moveError);
        return null;
      }

      const player = playersById.get(playerId);
      const updatedRemaining = (player?.remaining_pieces || []).filter((id) => id !== pieceId);

      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({ remaining_pieces: updatedRemaining })
        .eq('id', playerId)
        .select('*')
        .single();

      if (updateError) {
        setError(updateError);
        return moveData;
      }

      setMoves((prev) => [...prev, moveData]);
      setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      if (currentPlayer?.id === updatedPlayer.id) {
        setCurrentPlayer(updatedPlayer);
      }
      return moveData;
    },
    [game, playersById, currentPlayer]
  );

  const passPlayer = useCallback(
    async (playerId) => {
      if (!game || !playerId) {
        setError(new Error('Missing game or player context'));
        return null;
      }

      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({ has_passed: true })
        .eq('id', playerId)
        .select('*')
        .single();

      if (updateError) {
        setError(updateError);
        return null;
      }

      setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      if (currentPlayer?.id === updatedPlayer.id) {
        setCurrentPlayer(updatedPlayer);
      }
      return updatedPlayer;
    },
    [game, currentPlayer]
  );

  const placePiece = useCallback(
    async (pieceId, gridPositions) => {
      if (!game || !currentPlayer) {
        setError(new Error('Missing game or player context'));
        return null;
      }

      const { data: moveData, error: moveError } = await supabase
        .from('moves')
        .insert({
          game_id: game.id,
          player_id: currentPlayer.id,
          piece_id: pieceId,
          grid_positions: gridPositions
        })
        .select('*')
        .single();

      if (moveError) {
        setError(moveError);
        return null;
      }

      const updatedRemaining = (currentPlayer.remaining_pieces || []).filter(
        (id) => id !== pieceId
      );

      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({ remaining_pieces: updatedRemaining })
        .eq('id', currentPlayer.id)
        .select('*')
        .single();

      if (updateError) {
        setError(updateError);
        return moveData;
      }

      setCurrentPlayer(updatedPlayer);
      setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      setMoves((prev) => [...prev, moveData]);
      return moveData;
    },
    [game, currentPlayer]
  );

  const passTurn = useCallback(async () => {
    if (!game || !currentPlayer) {
      setError(new Error('Missing game or player context'));
      return null;
    }

    const { data: updatedPlayer, error: updateError } = await supabase
      .from('players')
      .update({ has_passed: true })
      .eq('id', currentPlayer.id)
      .select('*')
      .single();

    if (updateError) {
      setError(updateError);
      return null;
    }

    setCurrentPlayer(updatedPlayer);
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    return updatedPlayer;
  }, [game, currentPlayer]);

  const subscribeToGame = useCallback(
    (gameId) => {
      if (!gameId) return () => {};

      const channel = supabase
        .channel(`game-${gameId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'moves', filter: `game_id=eq.${gameId}` },
          () => fetchGameData(gameId)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
          () => fetchGameData(gameId)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
          () => fetchGameData(gameId)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
    [fetchGameData]
  );

  useEffect(() => {
    if (!game?.id) return undefined;
    fetchGameData(game.id);
    const unsubscribe = subscribeToGame(game.id);
    return () => unsubscribe();
  }, [game?.id, fetchGameData, subscribeToGame]);

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
    addAiPlayers,
    joinGame,
    placePiece,
    placePieceForPlayer,
    passTurn,
    passPlayer,
    fetchGameData,
    subscribeToGame,
    playersById
  };
}
