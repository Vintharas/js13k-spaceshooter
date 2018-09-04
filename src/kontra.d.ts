interface Position {
  x: number;
  y: number;
}

interface Velocity {
  dx: number;
  dy: number;
}

interface SpriteBuilder {
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  type?: string;
  ttl?: number;
  update?(this: Sprite, dt?: number): void;
  render?(this: Sprite): void;
  isAlive?(): boolean;
  context?: CanvasRenderingContext2D;

  // other properties
  [others: string]: any;
}

interface Sprite extends Position, Velocity {
  type?: string;
  ttl?: number;
  update(dt?: number): void;
  render(): void;
  isAlive(): boolean;
  context: CanvasRenderingContext2D;

  // other properties
  [others: string]: any;
}

interface GameLoopBuilder {
  render?(): void;
  update?(dt?: number): void;
}
interface GameLoop {
  render(): void;
  update(dt?: number): void;
}

interface Keys {
  pressed(key: string): boolean;
}
interface Assets {
  images: any;
}
interface PoolBuilder {
  create(s: SpriteBuilder): any;
  maxSize?: number;
}

interface Pool {
  update(dt?: number): void;
  render(): void;
  clear(): void;
  get(s: SpriteBuilder): void;
  getAliveObjects(): Sprite[];
}

interface Kontra {
  sprite(s: SpriteBuilder): any;
  gameLoop(s: GameLoopBuilder): any;
  keys: Keys;
  assets: Assets;
  pool(p: PoolBuilder): Pool;
}

declare var kontra: Kontra;
