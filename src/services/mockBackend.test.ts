import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockBackend } from "./mockBackend";

beforeEach(async () => {
  vi.useFakeTimers();
  await mockBackend.logout();
  await vi.runAllTimersAsync();
});

describe("mock backend", () => {
  it("logs in and logs out through centralized calls", async () => {
    const login = mockBackend.login({ username: "Arcade Ace", password: "snake" });
    await vi.runAllTimersAsync();
    const user = await login;
    expect(user.username).toBe("Arcade_Ace");

    const session = mockBackend.getSession();
    await vi.runAllTimersAsync();
    expect(await session).toEqual(user);

    const logout = mockBackend.logout();
    await vi.runAllTimersAsync();
    await logout;

    const emptySession = mockBackend.getSession();
    await vi.runAllTimersAsync();
    expect(await emptySession).toBeNull();
  });

  it("signs up unique users and rejects duplicates", async () => {
    const signup = mockBackend.signUp({ username: "Fresh", password: "123" });
    await vi.runAllTimersAsync();
    await expect(signup).resolves.toMatchObject({ username: "Fresh" });

    await expect(mockBackend.signUp({ username: "Fresh", password: "123" })).rejects.toThrow("already exists");
  });

  it("returns sorted leaderboard after score submission", async () => {
    const submit = mockBackend.submitScore({ username: "Tester", score: 999, mode: "walls" });
    await vi.runAllTimersAsync();
    await submit;

    const board = mockBackend.getLeaderboard();
    await vi.runAllTimersAsync();
    const entries = await board;
    expect(entries[0]).toMatchObject({ username: "Tester", score: 999 });
    expect(entries.map((entry) => entry.score)).toEqual([...entries.map((entry) => entry.score)].sort((a, b) => b - a));
  });

  it("advances mocked live players for spectating", async () => {
    const before = mockBackend.getLivePlayers();
    await vi.runAllTimersAsync();
    const initial = await before;

    const after = mockBackend.advanceLivePlayers();
    await vi.runAllTimersAsync();
    const advanced = await after;

    expect(advanced).toHaveLength(initial.length);
    expect(advanced.some((player, index) => player.state.snake[0].x !== initial[index].state.snake[0].x || player.state.snake[0].y !== initial[index].state.snake[0].y)).toBe(true);
  });
});
