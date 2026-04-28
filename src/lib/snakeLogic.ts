export type SnakeMode = "pass-through" | "walls";
export type Direction = "up" | "down" | "left" | "right";

export type Point = {
  x: number;
  y: number;
};

export type SnakeState = {
  gridSize: number;
  snake: Point[];
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  mode: SnakeMode;
  status: "ready" | "playing" | "paused" | "game-over";
};

const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const opposites: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const pointsEqual = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export const createInitialSnakeState = (mode: SnakeMode = "walls", gridSize = 18): SnakeState => {
  const middle = Math.floor(gridSize / 2);

  return {
    gridSize,
    snake: [
      { x: middle, y: middle },
      { x: middle - 1, y: middle },
      { x: middle - 2, y: middle },
    ],
    food: { x: middle + 4, y: middle },
    direction: "right",
    nextDirection: "right",
    score: 0,
    mode,
    status: "ready",
  };
};

export const wrapPoint = (point: Point, gridSize: number): Point => ({
  x: (point.x + gridSize) % gridSize,
  y: (point.y + gridSize) % gridSize,
});

export const isOppositeDirection = (current: Direction, next: Direction) => opposites[current] === next;

export const changeDirection = (state: SnakeState, nextDirection: Direction): SnakeState => {
  if (isOppositeDirection(state.direction, nextDirection)) {
    return state;
  }

  return { ...state, nextDirection };
};

export const isOutsideGrid = (point: Point, gridSize: number) =>
  point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;

export const getAvailableFoodCells = (snake: Point[], gridSize: number) => {
  const cells: Point[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = { x, y };
      if (!snake.some((part) => pointsEqual(part, cell))) {
        cells.push(cell);
      }
    }
  }

  return cells;
};

export const createFood = (snake: Point[], gridSize: number, seed = 0): Point => {
  const cells = getAvailableFoodCells(snake, gridSize);
  if (!cells.length) return snake[0];
  return cells[Math.abs(seed) % cells.length];
};

export const tickSnake = (state: SnakeState, seed = state.score + state.snake.length): SnakeState => {
  if (state.status !== "playing") return state;

  const direction = state.nextDirection;
  const vector = vectors[direction];
  const head = state.snake[0];
  let nextHead = { x: head.x + vector.x, y: head.y + vector.y };

  if (state.mode === "pass-through") {
    nextHead = wrapPoint(nextHead, state.gridSize);
  } else if (isOutsideGrid(nextHead, state.gridSize)) {
    return { ...state, direction, status: "game-over" };
  }

  const ateFood = pointsEqual(nextHead, state.food);
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);

  if (bodyToCheck.some((part) => pointsEqual(part, nextHead))) {
    return { ...state, direction, status: "game-over" };
  }

  const snake = ateFood ? [nextHead, ...state.snake] : [nextHead, ...state.snake.slice(0, -1)];

  return {
    ...state,
    snake,
    food: ateFood ? createFood(snake, state.gridSize, seed + 11) : state.food,
    direction,
    score: ateFood ? state.score + 10 : state.score,
  };
};

export const chooseBotDirection = (state: SnakeState): Direction => {
  const head = state.snake[0];
  const horizontal = state.food.x > head.x ? "right" : state.food.x < head.x ? "left" : state.direction;
  const vertical = state.food.y > head.y ? "down" : state.food.y < head.y ? "up" : state.direction;
  const candidates: Direction[] = [horizontal, vertical, state.direction, "right", "down", "left", "up"];

  for (const direction of candidates) {
    const candidate = changeDirection(state, direction).nextDirection;
    const preview = tickSnake({ ...state, nextDirection: candidate }, state.score + direction.length);
    if (preview.status !== "game-over") return candidate;
  }

  return state.direction;
};
