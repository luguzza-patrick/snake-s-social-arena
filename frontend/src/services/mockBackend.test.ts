import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockBackend } from "./mockBackend";

beforeEach(async () => {
  // Clear session by logging out
  await mockBackend.logout();
});

describe("mock backend", () => {
  it("logs in and logs out through centralized calls", async () => {
    const username = `Arcade_Ace_${Math.random()}`;
    // Ensure user exists
    const user = await mockBackend.signUp({ username, password: "snake" });
    expect(user.username).toBe(username);

    const loggedInUser = await mockBackend.login({ username, password: "snake" });
    expect(loggedInUser.username).toBe(username);

    const session = await mockBackend.getSession();
    expect(session).toEqual(loggedInUser);

    await mockBackend.logout();

    const emptySession = await mockBackend.getSession();
    expect(emptySession).toBeNull();
  });

  it("signs up unique users and rejects duplicates", async () => {
    const username = `Fresh_${Math.random()}`;
    const signup = await mockBackend.signUp({ username, password: "123" });
    expect(signup).toMatchObject({ username });

    await expect(mockBackend.signUp({ username, password: "123" })).rejects.toThrow();
  });

  it("returns sorted leaderboard after score submission", async () => {
    const username = `Tester_${Math.random()}`;
    await mockBackend.submitScore({ username, score: 999, mode: "walls" });

    const entries = await mockBackend.getLeaderboard();
    expect(entries.some(e => e.username === username && e.score === 999)).toBe(true);
    const scores = entries.map((entry) => entry.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it("advances mocked live players for spectating", async () => {
    const initial = await mockBackend.getLivePlayers();
    const advanced = await mockBackend.advanceLivePlayers();

    expect(advanced).toHaveLength(initial.length);
  });
});
