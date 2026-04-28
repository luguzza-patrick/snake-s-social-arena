import { describe, expect, it } from "vitest";
import { changeDirection, chooseBotDirection, createFood, createInitialSnakeState, tickSnake, wrapPoint } from "./snakeLogic";

describe("snake logic", () => {
  it("wraps through edges in pass-through mode", () => {
    const state = {
      ...createInitialSnakeState("pass-through", 6),
      status: "playing" as const,
      snake: [{ x: 5, y: 2 }, { x: 4, y: 2 }],
      food: { x: 3, y: 3 },
      direction: "right" as const,
      nextDirection: "right" as const,
    };

    expect(tickSnake(state).snake[0]).toEqual({ x: 0, y: 2 });
    expect(wrapPoint({ x: -1, y: 6 }, 6)).toEqual({ x: 5, y: 0 });
  });

  it("ends the run when a wall is hit in walls mode", () => {
    const state = {
      ...createInitialSnakeState("walls", 6),
      status: "playing" as const,
      snake: [{ x: 5, y: 2 }, { x: 4, y: 2 }],
      direction: "right" as const,
      nextDirection: "right" as const,
    };

    expect(tickSnake(state).status).toBe("game-over");
  });

  it("grows, scores, and moves food when food is eaten", () => {
    const state = {
      ...createInitialSnakeState("walls", 8),
      status: "playing" as const,
      snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }],
      food: { x: 3, y: 2 },
      direction: "right" as const,
      nextDirection: "right" as const,
    };

    const next = tickSnake(state, 2);
    expect(next.score).toBe(10);
    expect(next.snake).toHaveLength(3);
    expect(next.food).not.toEqual({ x: 3, y: 2 });
  });

  it("prevents direct reverse turns", () => {
    const state = createInitialSnakeState("walls", 8);
    expect(changeDirection(state, "left").nextDirection).toBe("right");
    expect(changeDirection(state, "down").nextDirection).toBe("down");
  });

  it("detects self collision and creates food off the snake", () => {
    const state = {
      ...createInitialSnakeState("walls", 8),
      status: "playing" as const,
      snake: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 3 }],
      direction: "right" as const,
      nextDirection: "down" as const,
    };

    expect(tickSnake(state).status).toBe("game-over");
    const food = createFood(state.snake, 8, 4);
    expect(state.snake).not.toContainEqual(food);
  });

  it("chooses a safe bot direction", () => {
    const state = { ...createInitialSnakeState("walls", 8), status: "playing" as const };
    const direction = chooseBotDirection(state);
    expect(["up", "down", "left", "right"]).toContain(direction);
  });
});
