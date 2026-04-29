import { describe, it, expect } from "vitest";
import { 
  createInitialSnakeState, 
  wrapPoint, 
  isOppositeDirection, 
  tickSnake,
  pointsEqual 
} from "../lib/snakeLogic";

describe("snakeLogic", () => {
  describe("createInitialSnakeState", () => {
    it("should initialize with default values", () => {
      const state = createInitialSnakeState("walls", 18);
      expect(state.gridSize).toBe(18);
      expect(state.mode).toBe("walls");
      expect(state.status).toBe("ready");
      expect(state.score).toBe(0);
      expect(state.snake).toHaveLength(3);
    });
  });

  describe("wrapPoint", () => {
    it("should wrap points outside the grid", () => {
      const gridSize = 10;
      expect(wrapPoint({ x: -1, y: 5 }, gridSize)).toEqual({ x: 9, y: 5 });
      expect(wrapPoint({ x: 10, y: 5 }, gridSize)).toEqual({ x: 0, y: 5 });
      expect(wrapPoint({ x: 5, y: -1 }, gridSize)).toEqual({ x: 5, y: 9 });
      expect(wrapPoint({ x: 5, y: 10 }, gridSize)).toEqual({ x: 5, y: 0 });
    });
  });

  describe("isOppositeDirection", () => {
    it("should correctly identify opposite directions", () => {
      expect(isOppositeDirection("up", "down")).toBe(true);
      expect(isOppositeDirection("down", "up")).toBe(true);
      expect(isOppositeDirection("left", "right")).toBe(true);
      expect(isOppositeDirection("right", "left")).toBe(true);
    });

    it("should return false for non-opposite directions", () => {
      expect(isOppositeDirection("up", "left")).toBe(false);
      expect(isOppositeDirection("up", "up")).toBe(false);
    });
  });

  describe("tickSnake", () => {
    it("should move the snake forward when playing", () => {
      const initialState = createInitialSnakeState("walls", 18);
      const playingState = { ...initialState, status: "playing" as const };
      
      const headBefore = playingState.snake[0];
      const nextState = tickSnake(playingState);
      const headAfter = nextState.snake[0];

      expect(headAfter.x).toBe(headBefore.x + 1); // Default direction is "right"
      expect(headAfter.y).toBe(headBefore.y);
      expect(nextState.snake).toHaveLength(3);
    });

    it("should not move if status is not playing", () => {
      const state = createInitialSnakeState("walls", 18);
      const nextState = tickSnake(state);
      expect(nextState.snake).toEqual(state.snake);
    });

    it("should trigger game over when hitting a wall in walls mode", () => {
      const state = {
        ...createInitialSnakeState("walls", 10),
        status: "playing" as const,
        snake: [{ x: 9, y: 5 }, { x: 8, y: 5 }, { x: 7, y: 5 }],
        direction: "right" as const,
        nextDirection: "right" as const,
      };

      const nextState = tickSnake(state);
      expect(nextState.status).toBe("game-over");
    });

    it("should wrap around when hitting a wall in pass-through mode", () => {
      const state = {
        ...createInitialSnakeState("pass-through", 10),
        status: "playing" as const,
        snake: [{ x: 9, y: 5 }, { x: 8, y: 5 }, { x: 7, y: 5 }],
        direction: "right" as const,
        nextDirection: "right" as const,
      };

      const nextState = tickSnake(state);
      expect(nextState.status).toBe("playing");
      expect(nextState.snake[0]).toEqual({ x: 0, y: 5 });
    });

    it("should eat food and grow", () => {
      const state = {
        ...createInitialSnakeState("walls", 10),
        status: "playing" as const,
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 6, y: 5 },
        direction: "right" as const,
        nextDirection: "right" as const,
        score: 0,
      };

      const nextState = tickSnake(state);
      expect(nextState.snake).toHaveLength(4);
      expect(nextState.score).toBe(10);
      expect(pointsEqual(nextState.snake[0], state.food)).toBe(true);
    });
  });
});
