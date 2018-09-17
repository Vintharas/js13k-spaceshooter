export interface CollisionStrategy {
  updateTicker(dt: number): void;
  isApplicable(s1: Sprite, s2: Sprite): boolean;
  handleCollision(s1: Sprite, s2: Sprite): boolean;
  period?: number;
}

export abstract class BaseCollisionStrategy implements CollisionStrategy {
  abstract isApplicable(s1: Sprite, s2: Sprite): boolean;
  abstract handleCollision(s1: Sprite, s2: Sprite): boolean;
  protected dt = 0;

  constructor(public period: number = 0) {}

  updateTicker(dt: number) {
    this.dt += dt;
  }

  protected withinPeriod() {
    return this.dt > this.period;
  }

  protected resetTicker() {
    this.dt = 0;
  }
}
