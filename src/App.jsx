import { useMemo, useState } from 'react';
import GameBoard from './components/GameBoard.jsx';
import GameHeader from './components/GameHeader.jsx';
import GameLobby from './components/GameLobby.jsx';
import GameOver from './components/GameOver.jsx';
import PieceControls from './components/PieceControls.jsx';
import PiecePalette from './components/PiecePalette.jsx';
import { useGameState } from './hooks/useGameState.js';
import { useOfflineGame } from './hooks/useOfflineGame.js';
import { useSupabaseGame } from './hooks/useSupabaseGame.js';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import { getPieceById, PIECES } from './utils/pieces.js';
import { calculateScore } from './utils/scoring.js';

function getNextPlayerIndex(players, currentIndex) {
  if (!players.length) return 0;
  for (let offset = 1; offset <= players.length; offset += 1) {
    const nextIndex = (currentIndex + offset) % players.length;
    if (!players[nextIndex].has_passed) {
      return nextIndex;
    }
  }
  return currentIndex;
}

export default function App() {
  const [useOfflineMode, setUseOfflineMode] = useState(!isSupabaseConfigured);
  const supabaseGame = useSupabaseGame();
  const offlineGame = useOfflineGame();
  const gameApi = useOfflineMode ? offlineGame : supabaseGame;

  const {
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
    joinGame,
    placePiece,
    passTurn
  } = gameApi;

  const {
    grid,
    players: playersSorted,
    currentTurn,
    selectedPiece,
    setSelectedPiece,
    pieceTransform,
    setPieceTransform
  } = useGameState({ game, players, moves });

  const selectedPieceData = useMemo(
    () => getPieceById(selectedPiece),
    [selectedPiece]
  );

  const isFirstMove = useMemo(() => {
    if (!currentTurn) return false;
    return !moves.some((move) => move.player_id === currentTurn.id);
  }, [moves, currentTurn]);

  const scores = useMemo(() => {
    if (!playersSorted.length) return [];
    return playersSorted.map((player) => {
      const remainingIds = player.remaining_pieces || [];
      const remainingPieces = PIECES.filter((piece) => remainingIds.includes(piece.id));
      const allPiecesPlaced = remainingIds.length === 0;
      const lastPieceWasI1 = false;
      return {
        player,
        score: calculateScore(remainingPieces, allPiecesPlaced, lastPieceWasI1)
      };
    });
  }, [playersSorted]);

  const handleStartGame = async () => {
    if (!game) return;
    if (useOfflineMode) {
      setGame({ ...game, status: 'active' });
      return;
    }

    await supabase.from('games').update({ status: 'active' }).eq('id', game.id);
  };

  const handlePass = async () => {
    if (!game || !currentTurn || currentTurn.id !== currentPlayer?.id) return;
    const updatedPlayer = await passTurn();
    if (!updatedPlayer) return;

    const updatedPlayers = playersSorted.map((player) =>
      player.id === updatedPlayer.id ? updatedPlayer : player
    );
    const allPassed = updatedPlayers.every((player) => player.has_passed);

    if (allPassed) {
      if (useOfflineMode) {
        setGame({ ...game, status: 'finished' });
      } else {
        await supabase.from('games').update({ status: 'finished' }).eq('id', game.id);
      }
      return;
    }

    const nextIndex = getNextPlayerIndex(updatedPlayers, game.current_player_index);
    if (useOfflineMode) {
      setGame({ ...game, current_player_index: nextIndex });
      return;
    }

    await supabase.from('games').update({ current_player_index: nextIndex }).eq('id', game.id);
  };

  const handlePlacePiece = async (gridPositions) => {
    if (!game || !currentTurn || currentTurn.id !== currentPlayer?.id) return;
    if (!selectedPieceData) return;

    const move = await placePiece(selectedPieceData.id, gridPositions);
    if (!move) return;

    const nextIndex = getNextPlayerIndex(playersSorted, game.current_player_index);
    if (useOfflineMode) {
      setGame({ ...game, current_player_index: nextIndex });
    } else {
      await supabase.from('games').update({ current_player_index: nextIndex }).eq('id', game.id);
    }

    setSelectedPiece(null);
  };

  const handleResetLobby = () => {
    setGame(null);
    setPlayers([]);
    setMoves([]);
    setCurrentPlayer(null);
    setSelectedPiece(null);
    setPieceTransform({ rotation: 0, flipH: false, flipV: false });
  };

  const handleStartOffline = async () => {
    setUseOfflineMode(true);
    await offlineGame.createGame();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl p-6">
        {!game || game.status === 'waiting' ? (
          <div className="space-y-4">
            {!isSupabaseConfigured && !useOfflineMode ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Supabase is not configured yet. Add `VITE_SUPABASE_URL` and
                `VITE_SUPABASE_ANON_KEY` in `.env`, then restart the dev server.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error.message || 'Something went wrong'}
              </div>
            ) : null}
            <GameLobby
              game={game}
              players={playersSorted}
              loading={loading}
              onCreateGame={createGame}
              onJoinGame={joinGame}
              onStartGame={handleStartGame}
              showOffline={!useOfflineMode}
              onStartOffline={handleStartOffline}
            />
          </div>
        ) : game.status === 'finished' ? (
          <GameOver scores={scores} onNewGame={handleResetLobby} />
        ) : (
          <div className="space-y-6">
            <GameHeader
              game={game}
              players={playersSorted}
              currentTurn={currentTurn}
              onPass={handlePass}
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error.message || 'Something went wrong'}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <GameBoard
                grid={grid}
                piece={selectedPieceData}
                transform={pieceTransform}
                playerColor={currentTurn?.color}
                isFirstMove={isFirstMove}
                onPlace={handlePlacePiece}
              />

              <div className="space-y-4">
                <PiecePalette
                  player={currentPlayer}
                  isActive={currentTurn?.id === currentPlayer?.id}
                  selectedPieceId={selectedPiece}
                  onSelectPiece={setSelectedPiece}
                  transform={pieceTransform}
                />
                <PieceControls
                  onRotateCCW={() =>
                    setPieceTransform((prev) => ({
                      ...prev,
                      rotation: prev.rotation - 90
                    }))
                  }
                  onRotateCW={() =>
                    setPieceTransform((prev) => ({
                      ...prev,
                      rotation: prev.rotation + 90
                    }))
                  }
                  onFlipH={() =>
                    setPieceTransform((prev) => ({
                      ...prev,
                      flipH: !prev.flipH
                    }))
                  }
                  onFlipV={() =>
                    setPieceTransform((prev) => ({
                      ...prev,
                      flipV: !prev.flipV
                    }))
                  }
                  onReset={() =>
                    setPieceTransform({ rotation: 0, flipH: false, flipV: false })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
