import { Crown, Eye, Gamepad2, LogOut, Pause, Play, RotateCcw, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { changeDirection, createInitialSnakeState, pointsEqual, tickSnake, type Direction, type SnakeMode, type SnakeState } from "@/lib/snakeLogic";
import { mockBackend, type LeaderboardEntry, type MockUser, type SpectatedPlayer } from "@/services/mockBackend";

const directions: Record<string, Direction> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

const modeLabel: Record<SnakeMode, string> = {
  "pass-through": "Pass-through",
  walls: "Walls",
};

const MiniGrid = ({ state, compact = false }: { state: SnakeState; compact?: boolean }) => (
  <div
    className={`grid aspect-square w-full rounded-lg border border-board-border bg-board shadow-board ${compact ? "gap-0.5 p-1" : "gap-1 p-2"}`}
    style={{ gridTemplateColumns: `repeat(${state.gridSize}, minmax(0, 1fr))` }}
    aria-label="Snake game board"
  >
    {Array.from({ length: state.gridSize * state.gridSize }, (_, index) => {
      const point = { x: index % state.gridSize, y: Math.floor(index / state.gridSize) };
      const snakeIndex = state.snake.findIndex((part) => pointsEqual(part, point));
      const isFood = pointsEqual(state.food, point);
      return (
        <div
          key={`${point.x}-${point.y}`}
          className={`aspect-square rounded-sm transition-transform duration-150 ${
            snakeIndex === 0
              ? "bg-snake-head shadow-glow scale-105"
              : snakeIndex > -1
                ? "bg-snake-body"
                : isFood
                  ? "bg-food animate-pulse"
                  : "bg-board-cell"
          }`}
        />
      );
    })}
  </div>
);

const AuthPanel = ({ user, onUser }: { user: MockUser | null; onUser: (user: MockUser | null) => void }) => {
  const [username, setUsername] = useState("pixel");
  const [password, setPassword] = useState("snake");
  const [error, setError] = useState("");

  const submit = async (type: "login" | "signup") => {
    setError("");
    try {
      const nextUser = type === "login" ? await mockBackend.login({ username, password }) : await mockBackend.signUp({ username, password });
      onUser(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (user) {
    return (
      <section className="rounded-lg border border-panel-border bg-panel/90 p-4 shadow-panel backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Logged in</p>
            <p className="font-display text-2xl text-panel-foreground">{user.username}</p>
          </div>
          <Button variant="terminal" size="icon" aria-label="Log out" onClick={async () => { await mockBackend.logout(); onUser(null); }}>
            <LogOut />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-panel-border bg-panel/90 p-4 shadow-panel backdrop-blur">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Login</p>
      <div className="mt-3 grid gap-2">
        <input className="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="username" />
        <input className="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password" />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="arcade" onClick={() => submit("login")}><Gamepad2 /> Log in</Button>
        <Button variant="terminal" onClick={() => submit("signup")}><UserPlus /> Sign up</Button>
      </div>
    </section>
  );
};

export const SnakeArcade = () => {
  const [mode, setMode] = useState<SnakeMode>("walls");
  const [game, setGame] = useState(() => createInitialSnakeState("walls"));
  const [user, setUser] = useState<MockUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [players, setPlayers] = useState<SpectatedPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("s-1");
  const [screen, setScreen] = useState<"play" | "leaderboard" | "watch">("play");

  const selectedPlayer = useMemo(() => players.find((player) => player.id === selectedPlayerId) ?? players[0], [players, selectedPlayerId]);

  useEffect(() => {
    mockBackend.getSession().then(setUser);
    mockBackend.getLeaderboard().then(setLeaderboard);
    mockBackend.getLivePlayers().then(setPlayers);
  }, []);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const direction = directions[event.key];
      if (direction) {
        event.preventDefault();
        setGame((current) => changeDirection(current, direction));
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGame((current) => tickSnake(current));
    }, 135);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      mockBackend.advanceLivePlayers().then(setPlayers);
    }, 430);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (game.status === "game-over" && game.score > 0) {
      mockBackend.submitScore({ score: game.score, mode }).then(() => mockBackend.getLeaderboard().then(setLeaderboard));
    }
  }, [game.status, game.score, mode]);

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setGame(createInitialSnakeState(nextMode));
  };

  const startPause = () => {
    setGame((current) => ({ ...current, status: current.status === "playing" ? "paused" : "playing" }));
  };

  const navItems = [
    { id: "play", label: "Play" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "watch", label: "Watch live" },
  ] as const;

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-scanlines opacity-60" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:px-6">
        <header className="grid gap-4 rounded-lg border border-panel-border bg-panel/90 p-4 shadow-panel backdrop-blur lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Multiplayer-ready</p>
            <h1 className="mt-2 font-display text-5xl leading-none text-primary">Snake Relay</h1>
            <nav className="mt-4 flex flex-wrap gap-2" aria-label="Main game sections">
              {navItems.map((item) => (
                <Button key={item.id} variant={screen === item.id ? "arcade" : "terminal"} onClick={() => setScreen(item.id)}>
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          <div className="lg:justify-self-end">
            <AuthPanel user={user} onUser={setUser} />
          </div>
        </header>

        {screen === "play" && (
          <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4">
            <div className="rounded-lg border border-primary/40 bg-panel p-3 shadow-hero">
              <MiniGrid state={game} />
            </div>
            <div className="grid gap-3 rounded-lg border border-panel-border bg-panel/90 p-4 shadow-panel backdrop-blur sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-wrap gap-2">
                {(["walls", "pass-through"] as SnakeMode[]).map((item) => (
                  <Button key={item} variant={mode === item ? "arcade" : "terminal"} onClick={() => reset(item)}>{modeLabel[item]}</Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-2 font-display text-3xl text-accent">{game.score}</div>
                <Button variant="arcade" onClick={startPause}>{game.status === "playing" ? <Pause /> : <Play />} {game.status === "playing" ? "Pause" : "Play"}</Button>
                <Button variant="terminal" size="icon" aria-label="Reset" onClick={() => reset()}><RotateCcw /></Button>
              </div>
              <p className="text-sm text-muted-foreground sm:col-span-2">Use arrow keys or WASD. In pass-through mode edges wrap; in walls mode edges end the run.</p>
              {game.status === "game-over" && <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">Game over — reset or switch modes for another run.</p>}
            </div>
          </section>
        )}

        {screen === "leaderboard" && (
          <section className="mx-auto w-full max-w-4xl rounded-lg border border-panel-border bg-panel/90 p-5 shadow-panel backdrop-blur">
            <div className="flex items-center gap-2 text-panel-foreground"><Crown className="size-4 text-accent" /><h2 className="font-display text-3xl">Leaderboard</h2></div>
            <div className="mt-4 space-y-2">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-md bg-secondary px-4 py-3 text-sm">
                  <span className="font-display text-xl text-accent">#{index + 1}</span>
                  <span className="truncate font-semibold">{entry.username}<span className="ml-2 text-xs text-muted-foreground">{modeLabel[entry.mode]}</span></span>
                  <span className="font-display text-2xl">{entry.score}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen === "watch" && (
          <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[320px_1fr]">
            <div className="rounded-lg border border-panel-border bg-panel/90 p-4 shadow-panel backdrop-blur">
              <div className="flex items-center gap-2 text-panel-foreground"><Eye className="size-4 text-accent" /><h2 className="font-display text-3xl">Watch live</h2></div>
              <div className="mt-3 grid gap-2">
                {players.map((player) => (
                  <button key={player.id} className={`rounded-md border px-3 py-2 text-left transition-all hover:-translate-y-0.5 ${selectedPlayer?.id === player.id ? "border-primary bg-primary/15" : "border-panel-border bg-secondary"}`} onClick={() => setSelectedPlayerId(player.id)}>
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold"><span>{player.username}</span><span className="font-display text-accent">{player.state.score}</span></span>
                    <span className="text-xs text-muted-foreground">{modeLabel[player.mode]} · currently playing</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedPlayer && (
              <div className="rounded-lg border border-panel-border bg-panel/90 p-4 shadow-panel backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Following</p>
                    <h3 className="font-display text-3xl">{selectedPlayer.username}</h3>
                  </div>
                  <span className="rounded-md bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">LIVE</span>
                </div>
                <MiniGrid state={selectedPlayer.state} compact />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};
