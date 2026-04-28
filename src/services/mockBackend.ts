import { createInitialSnakeState, chooseBotDirection, changeDirection, tickSnake, type SnakeMode, type SnakeState } from "@/lib/snakeLogic";

export type MockUser = {
  id: string;
  username: string;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  score: number;
  mode: SnakeMode;
};

export type SpectatedPlayer = {
  id: string;
  username: string;
  mode: SnakeMode;
  state: SnakeState;
};

type Credentials = {
  username: string;
  password: string;
};

const users = new Map<string, MockUser>([
  ["pixel", { id: "u-pixel", username: "pixel" }],
]);

let currentUser: MockUser | null = null;

let leaderboard: LeaderboardEntry[] = [
  { id: "l-1", username: "NeonNoodle", score: 420, mode: "pass-through" },
  { id: "l-2", username: "WallRunner", score: 360, mode: "walls" },
  { id: "l-3", username: "ByteFang", score: 310, mode: "pass-through" },
  { id: "l-4", username: "GridGhost", score: 260, mode: "walls" },
];

let spectatedPlayers: SpectatedPlayer[] = [
  { id: "s-1", username: "NeonNoodle", mode: "pass-through", state: { ...createInitialSnakeState("pass-through", 12), status: "playing", score: 80 } },
  { id: "s-2", username: "WallRunner", mode: "walls", state: { ...createInitialSnakeState("walls", 12), status: "playing", score: 50, food: { x: 3, y: 9 } } },
  { id: "s-3", username: "ByteFang", mode: "pass-through", state: { ...createInitialSnakeState("pass-through", 12), status: "playing", score: 120, food: { x: 9, y: 2 } } },
];

const wait = async <T,>(value: T): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 120);
  });

const normalizeUsername = (username: string) => username.trim().replace(/\s+/g, "_").slice(0, 18);

export const mockBackend = {
  async getSession() {
    return wait(currentUser);
  },

  async login(credentials: Credentials) {
    const username = normalizeUsername(credentials.username);
    if (!username || credentials.password.length < 3) {
      throw new Error("Use a username and a password with at least 3 characters.");
    }

    const user = users.get(username.toLowerCase()) ?? { id: `u-${username.toLowerCase()}`, username };
    users.set(username.toLowerCase(), user);
    currentUser = user;
    return wait(user);
  },

  async signUp(credentials: Credentials) {
    const username = normalizeUsername(credentials.username);
    if (!username || credentials.password.length < 3) {
      throw new Error("Use a username and a password with at least 3 characters.");
    }

    if (users.has(username.toLowerCase())) {
      throw new Error("That username already exists in the mock arcade.");
    }

    const user = { id: `u-${Date.now()}`, username };
    users.set(username.toLowerCase(), user);
    currentUser = user;
    return wait(user);
  },

  async logout() {
    currentUser = null;
    return wait(true);
  },

  async getLeaderboard() {
    return wait([...leaderboard].sort((a, b) => b.score - a.score));
  },

  async submitScore(entry: Omit<LeaderboardEntry, "id" | "username"> & { username?: string }) {
    const username = entry.username ?? currentUser?.username ?? "Guest Snake";
    const row = { id: `l-${Date.now()}`, username, score: entry.score, mode: entry.mode };
    leaderboard = [row, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 8);
    return wait(row);
  },

  async getLivePlayers() {
    return wait(spectatedPlayers.map((player) => ({ ...player, state: { ...player.state, snake: [...player.state.snake] } })));
  },

  async advanceLivePlayers() {
    spectatedPlayers = spectatedPlayers.map((player, index) => {
      const nextDirection = chooseBotDirection(player.state);
      const advanced = tickSnake(changeDirection(player.state, nextDirection), index + player.state.score + 1);
      const state = advanced.status === "game-over" ? { ...createInitialSnakeState(player.mode, 12), status: "playing" as const } : advanced;
      return { ...player, state };
    });

    return this.getLivePlayers();
  },
};
