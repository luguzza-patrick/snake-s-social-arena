import { type SnakeMode, type SnakeState } from "@/lib/snakeLogic";

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

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

let clientSideCookieJar: string | null = null;

const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };

  if (clientSideCookieJar) {
    headers["Cookie"] = clientSideCookieJar;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    // Basic parsing to extract the token part
    clientSideCookieJar = setCookie.split(";")[0];
  }

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const data = await response.json();
      errorMessage = data.detail || errorMessage;
    } catch {
      if (response.status === 401) {
        errorMessage = "Unauthorized";
      } else if (response.status === 400) {
        errorMessage = "Bad Request";
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const mockBackend = {
  async getSession(): Promise<MockUser | null> {
    try {
      return await apiFetch("/auth/session");
    } catch (e) {
      return null;
    }
  },

  async login(credentials: Credentials): Promise<MockUser> {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async signUp(credentials: Credentials): Promise<MockUser> {
    return apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<boolean> {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return apiFetch("/leaderboard");
  },

  async submitScore(entry: Omit<LeaderboardEntry, "id" | "username"> & { username?: string }): Promise<LeaderboardEntry> {
    return apiFetch("/leaderboard", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  async getLivePlayers(): Promise<SpectatedPlayer[]> {
    return apiFetch("/live-players");
  },

  async advanceLivePlayers(): Promise<SpectatedPlayer[]> {
    // This method was a mock feature to simulate other players moving.
    // In a real application, the backend state would update independently.
    // We can just fetch the latest state from the backend.
    return this.getLivePlayers();
  },
};
