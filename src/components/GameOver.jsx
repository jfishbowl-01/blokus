export default function GameOver({ scores, onNewGame }) {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl">
      <h2 className="text-2xl font-semibold text-slate-900">Game Over</h2>
      <p className="mt-2 text-sm text-slate-600">Final scores</p>

      <div className="mt-6 grid gap-3">
        {scores.map((score) => (
          <div
            key={score.player.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <span className="font-semibold text-slate-800">
              {score.player.player_name || score.player.color}
            </span>
            <span className="text-slate-600">{score.score}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNewGame}
        className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
      >
        New Game
      </button>
    </div>
  );
}
