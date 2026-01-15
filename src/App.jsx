import { useEffect, useMemo, useState } from 'react';
import GameBoard from './components/GameBoard.jsx';
import GameHeader from './components/GameHeader.jsx';
import GameLobby from './components/GameLobby.jsx';
import GameOver from './components/GameOver.jsx';
import PieceControls from './components/PieceControls.jsx';
import PiecePalette from './components/PiecePalette.jsx';
import SinglePlayerSetup from './components/SinglePlayerSetup.jsx';
import StartScreen from './components/StartScreen.jsx';
import TutorialScreen from './components/TutorialScreen.jsx';
import { useGameState } from './hooks/useGameState.js';
import { useOfflineGame } from './hooks/useOfflineGame.js';
import { useSupabaseGame } from './hooks/useSupabaseGame.js';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import { findMoveForPlayer } from './utils/ai.js';
import { playPlacementSound } from './utils/sound.js';
import { getPieceById, PIECES } from './utils/pieces.js';
import { calculateScore } from './utils/scoring.js';
import { resolveDisplayColor } from './utils/colors.js';

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
  const compactPreferenceKey = 'blokus-compact-mode';
  const [useOfflineMode, setUseOfflineMode] = useState(!isSupabaseConfigured);
  const [pendingPlacement, setPendingPlacement] = useState(null);
  const [screen, setScreen] = useState('home');
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [compactPreference, setCompactPreference] = useState(() => {
    if (typeof window === 'undefined') return 'auto';
    const stored = window.localStorage.getItem(compactPreferenceKey);
    if (stored === 'compact' || stored === 'full') return stored;
    return 'auto';
  });
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });
  const [aiDriverGameId, setAiDriverGameId] = useState(null);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('blokus-sound');
    if (stored === 'off') return false;
    return true;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('blokus-theme');
    if (stored) return stored === 'dark';
    return false;
  });
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
  const { addAiPlayers, placePieceForPlayer, passPlayer, resumeSession, clearSession } =
    supabaseGame;

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

  const isPlayerTurn = currentTurn?.id === currentPlayer?.id;

  useEffect(() => {
    if (pendingPlacement) {
      setPendingPlacement(null);
    }
  }, [selectedPiece, pieceTransform, currentTurn]);

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

  const placements = useMemo(() => {
    return [...scores].sort((a, b) => a.score - b.score);
  }, [scores]);

  const canUndo = useMemo(() => {
    if (!useOfflineMode) return false;
    return moves.length > 0;
  }, [useOfflineMode, moves.length]);

  const lastMovePositions = useMemo(() => {
    if (!moves.length) return null;
    const lastMove = moves[moves.length - 1];
    return Array.isArray(lastMove?.grid_positions) ? lastMove.grid_positions : null;
  }, [moves]);

  const isCompactBoard = useMemo(() => {
    if (compactPreference === 'compact') return true;
    if (compactPreference === 'full') return false;
    return isSmallScreen;
  }, [compactPreference, isSmallScreen]);

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
    setPendingPlacement(null);

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

  const applyOfflineMove = (playerId, pieceId, gridPositions) => {
    const player = players.find((entry) => entry.id === playerId);
    if (!player) return null;

    const updatedRemaining = (player.remaining_pieces || []).filter((id) => id !== pieceId);
    const move = {
      id: `move-${Date.now()}-${pieceId}`,
      game_id: game.id,
      player_id: playerId,
      piece_id: pieceId,
      grid_positions: gridPositions,
      placed_at: new Date().toISOString()
    };

    const nextPlayers = players.map((entry) =>
      entry.id === playerId ? { ...entry, remaining_pieces: updatedRemaining } : entry
    );

    setMoves((prev) => [...prev, move]);
    setPlayers(nextPlayers);

    return { move, nextPlayers };
  };

  const applyOfflinePass = (playerId) => {
    const nextPlayers = players.map((entry) =>
      entry.id === playerId ? { ...entry, has_passed: true } : entry
    );
    setPlayers(nextPlayers);
    return nextPlayers;
  };

  const handlePlacePiece = async (gridPositions) => {
    if (!game || !currentTurn || currentTurn.id !== currentPlayer?.id) return;
    if (!selectedPieceData) return;

    const move = await placePiece(selectedPieceData.id, gridPositions);
    if (!move) return null;

    const nextIndex = getNextPlayerIndex(playersSorted, game.current_player_index);
    if (useOfflineMode) {
      setGame({ ...game, current_player_index: nextIndex });
    } else {
      await supabase.from('games').update({ current_player_index: nextIndex }).eq('id', game.id);
    }

    setSelectedPiece(null);
    return move;
  };

  const handleConfirmPlacement = async () => {
    if (!pendingPlacement || !selectedPieceData) return;
    const move = await handlePlacePiece(pendingPlacement);
    if (!move) return;
    setPendingPlacement(null);
    if (soundEnabled) {
      playPlacementSound();
    }
  };

  const handleRotateLeft = () => {
    setPieceTransform((prev) => ({ ...prev, rotation: prev.rotation - 90 }));
  };

  const handleRotateRight = () => {
    setPieceTransform((prev) => ({ ...prev, rotation: prev.rotation + 90 }));
  };

  const handleFlipH = () => {
    setPieceTransform((prev) => ({ ...prev, flipH: !prev.flipH }));
  };

  const handleFlipV = () => {
    setPieceTransform((prev) => ({ ...prev, flipV: !prev.flipV }));
  };

  const handleUndo = async () => {
    if (!useOfflineMode) return;
    if (!game || moves.length === 0) return;
    const moveToUndo = moves[moves.length - 1];

    setMoves((prev) => prev.slice(0, -1));
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id !== moveToUndo.player_id) return player;
        const remaining = new Set(player.remaining_pieces || []);
        remaining.add(moveToUndo.piece_id);
        return { ...player, remaining_pieces: Array.from(remaining), has_passed: false };
      })
    );
    const undoPlayer = players.find((player) => player.id === moveToUndo.player_id);
    setGame((prev) => ({
      ...prev,
      current_player_index: undoPlayer?.join_order ?? prev.current_player_index
    }));
  };

  const handleResetLobby = () => {
    setGame(null);
    setPlayers([]);
    setMoves([]);
    setCurrentPlayer(null);
    setSelectedPiece(null);
    setPieceTransform({ rotation: 0, flipH: false, flipV: false });
    setPendingPlacement(null);
    setAiDriverGameId(null);
    if (clearSession) {
      clearSession();
    }
    setScreen('home');
  };

  const handleStartOffline = async () => {
    setUseOfflineMode(true);
    await offlineGame.createGame();
    setAiDriverGameId(null);
  };

  const handleFillWithAI = async () => {
    if (!game || useOfflineMode) return;
    const result = await addAiPlayers(game.id);
    if (result?.length) {
      setAiDriverGameId(game.id);
    }
  };

  const handleStartSinglePlayer = async (playerName, displayColor) => {
    setUseOfflineMode(true);
    await offlineGame.startSinglePlayer(playerName, displayColor);
    setScreen('playing');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateScreen = () => {
      setIsSmallScreen(window.matchMedia('(max-width: 767px)').matches);
    };

    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (compactPreference === 'auto') {
      window.localStorage.removeItem(compactPreferenceKey);
      return;
    }
    window.localStorage.setItem(compactPreferenceKey, compactPreference);
  }, [compactPreference, compactPreferenceKey]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('blokus-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('blokus-sound', soundEnabled ? 'on' : 'off');
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (screen !== 'home') return;
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setScreen('multi-setup');
    }
  }, [screen]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const runResume = async () => {
      const result = await resumeSession?.();
      if (!result || cancelled) return;
      setUseOfflineMode(false);
      setScreen('multi-setup');
    };
    runResume();
    return () => {
      cancelled = true;
    };
  }, [resumeSession]);

  useEffect(() => {
    const isTypingTarget = (event) => {
      const target = event.target;
      if (!target) return false;
      const tag = target.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || target.isContentEditable;
    };

    const handleKeyDown = (event) => {
      if (isTypingTarget(event)) return;
      if (event.key === ' ') {
        event.preventDefault();
        setPieceTransform((prev) => ({
          ...prev,
          rotation: prev.rotation + (event.shiftKey ? -90 : 90)
        }));
      }
      if (event.key === 'f' || event.key === 'F') {
        setPieceTransform((prev) => ({
          ...prev,
          flipH: !prev.flipH
        }));
      }
      if (event.key === 'v' || event.key === 'V') {
        setPieceTransform((prev) => ({
          ...prev,
          flipV: !prev.flipV
        }));
      }
      if (event.key === 'Escape') {
        setPendingPlacement(null);
      }
      if (event.key === 'Enter' && pendingPlacement) {
        handleConfirmPlacement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingPlacement, handleConfirmPlacement]);

  useEffect(() => {
    if (!game || game.status !== 'active') return;
    if (!currentTurn || !currentTurn.is_ai) return;
    if (currentTurn.has_passed) return;

    const canDriveAi = useOfflineMode || aiDriverGameId === game.id;
    if (!canDriveAi) return;

    let cancelled = false;
    const runAiTurn = async () => {
      const hasMoved = moves.some((move) => move.player_id === currentTurn.id);
      const move = findMoveForPlayer({
        grid,
        playerColor: currentTurn.color,
        remainingPieceIds: currentTurn.remaining_pieces,
        isFirstMove: !hasMoved,
        randomize: true,
        difficulty: aiDifficulty
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      if (cancelled) return;

      if (useOfflineMode) {
        let nextPlayers = playersSorted;
        if (move) {
          const result = applyOfflineMove(currentTurn.id, move.pieceId, move.gridPositions);
          nextPlayers = result?.nextPlayers || playersSorted;
        } else {
          nextPlayers = applyOfflinePass(currentTurn.id) || playersSorted;
        }

        const allPassed = nextPlayers.every((player) => player.has_passed);

        if (allPassed) {
          setGame({ ...game, status: 'finished' });
          return;
        }

        const nextIndex = getNextPlayerIndex(nextPlayers, game.current_player_index);
        setGame({ ...game, current_player_index: nextIndex });
        return;
      }

      let nextPlayers = playersSorted;
      if (move) {
        await placePieceForPlayer(currentTurn.id, move.pieceId, move.gridPositions);
        nextPlayers = playersSorted.map((player) =>
          player.id === currentTurn.id
            ? {
                ...player,
                remaining_pieces: player.remaining_pieces.filter((id) => id !== move.pieceId)
              }
            : player
        );
      } else {
        await passPlayer(currentTurn.id);
        nextPlayers = playersSorted.map((player) =>
          player.id === currentTurn.id ? { ...player, has_passed: true } : player
        );
      }

      const allPassed = nextPlayers.every((player) => player.has_passed);
      if (allPassed) {
        await supabase.from('games').update({ status: 'finished' }).eq('id', game.id);
        return;
      }

      const nextIndex = getNextPlayerIndex(nextPlayers, game.current_player_index);
      await supabase.from('games').update({ current_player_index: nextIndex }).eq('id', game.id);
    };

    runAiTurn();
    return () => {
      cancelled = true;
    };
  }, [
    useOfflineMode,
    aiDriverGameId,
    game,
    currentTurn,
    grid,
    moves,
    playersSorted,
    aiDifficulty,
    placePieceForPlayer,
    passPlayer
  ]);

  const showHome = screen === 'home';
  const showSingleTutorial = screen === 'single-tutorial';
  const showSingleSetup = screen === 'single-setup';
  const showMultiTutorial = screen === 'multi-tutorial';
  const showMultiSetup = screen === 'multi-setup';
  const isPlaying = game && game.status !== 'waiting';
  const showTransforms = isSmallScreen || showTransformControls;
  const showTransformToggle = !isSmallScreen;
  const layoutToggleLabel = isCompactBoard ? 'Full Layout' : 'Compact Layout';
  const layoutToggleClass = isCompactBoard
    ? 'rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
    : 'rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200';
  const themeToggleClass = isCompactBoard
    ? 'rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
    : 'rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200';
  const soundToggleClass = isCompactBoard
    ? 'rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
    : 'rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200';

  const playerDisplayMap = useMemo(() => {
    const map = {};
    playersSorted.forEach((player) => {
      map[player.color] = resolveDisplayColor(player);
    });
    return map;
  }, [playersSorted]);
  const currentDisplayColor = resolveDisplayColor(currentTurn);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl dark:bg-slate-800/40" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl dark:bg-slate-800/40" />

      <div className={`relative mx-auto max-w-6xl ${isCompactBoard ? 'p-3 sm:p-4' : 'p-6'}`}>
        <div className={`flex flex-wrap justify-end gap-2 ${isCompactBoard ? 'mb-4' : 'mb-6'}`}>
          {isPlaying ? (
            <button
              type="button"
              onClick={() => {
                setCompactPreference((prev) => {
                  if (prev === 'compact') return 'full';
                  if (prev === 'full') return 'compact';
                  return isCompactBoard ? 'full' : 'compact';
                });
              }}
              className={layoutToggleClass}
            >
              {layoutToggleLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={soundToggleClass}
          >
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={themeToggleClass}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        {showHome ? (
          <StartScreen
            onSelectMode={(mode) =>
              setScreen(mode === 'single' ? 'single-tutorial' : 'multi-tutorial')
            }
          />
        ) : showSingleTutorial ? (
          <TutorialScreen
            mode="single"
            onContinue={() => setScreen('single-setup')}
            onBack={() => setScreen('home')}
          />
        ) : showMultiTutorial ? (
          <TutorialScreen
            mode="multi"
            onContinue={() => setScreen('multi-setup')}
            onBack={() => setScreen('home')}
          />
        ) : showSingleSetup ? (
          <SinglePlayerSetup
            difficulty={aiDifficulty}
            onDifficultyChange={setAiDifficulty}
            onStart={handleStartSinglePlayer}
            onBack={() => setScreen('home')}
          />
        ) : showMultiSetup && !isPlaying ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setScreen('home')}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-600 dark:text-slate-200"
              >
                Back
              </button>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Multiplayer Setup
              </p>
            </div>
            {!isSupabaseConfigured && !useOfflineMode ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                Supabase is not configured yet. Add `VITE_SUPABASE_URL` and
                `VITE_SUPABASE_ANON_KEY` in `.env`, then restart the dev server.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
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
              showFillAI={!useOfflineMode && playersSorted.length > 0 && playersSorted.length < 4}
              onFillWithAI={handleFillWithAI}
            />
          </div>
        ) : game?.status === 'finished' ? (
          <GameOver placements={placements} onNewGame={handleResetLobby} />
        ) : (
          <div className="space-y-6">
            <GameHeader
              game={game}
              players={playersSorted}
              currentTurn={currentTurn}
              isPlayerTurn={currentTurn?.id === currentPlayer?.id}
              currentPlayerId={currentPlayer?.id}
              onPass={handlePass}
              onLeave={handleResetLobby}
              compact={isCompactBoard}
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {error.message || 'Something went wrong'}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <GameBoard
                grid={grid}
                piece={selectedPieceData}
                transform={pieceTransform}
                playerColor={currentTurn?.color}
                playerDisplayColor={currentDisplayColor}
                seatColorMap={playerDisplayMap}
                isFirstMove={isFirstMove}
                pendingPlacement={pendingPlacement}
                lastMovePositions={lastMovePositions}
                compact={isCompactBoard}
                isInteractive={isPlayerTurn}
                onDropPlacement={setPendingPlacement}
                onClearPending={() => setPendingPlacement(null)}
              />

              <div className="flex flex-col gap-4">
                <div className="order-2 lg:order-1">
                  <PiecePalette
                    player={currentPlayer}
                    isActive={currentTurn?.id === currentPlayer?.id}
                    isDisabled={!isPlayerTurn}
                    selectedPieceId={selectedPiece}
                    onSelectPiece={setSelectedPiece}
                    transform={pieceTransform}
                    compact={isCompactBoard}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <PieceControls
                    onConfirm={handleConfirmPlacement}
                    onUndo={handleUndo}
                    showUndo={canUndo}
                    canConfirm={
                      Boolean(pendingPlacement?.length) && currentTurn?.id === currentPlayer?.id
                    }
                    onRotateLeft={handleRotateLeft}
                    onRotateRight={handleRotateRight}
                    onFlipH={handleFlipH}
                    onFlipV={handleFlipV}
                    compact={isCompactBoard}
                    showTransformControls={showTransforms}
                    showTransformToggle={showTransformToggle}
                    onToggleTransformControls={() =>
                      setShowTransformControls((prev) => !prev)
                    }
                    showShortcutHint={!isSmallScreen}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
