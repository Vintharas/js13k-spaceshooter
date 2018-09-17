export interface CollisionStrategy {
  isApplicable(s1: Sprite, s2: Sprite, dt: number): boolean;
  handleCollision(s1: Sprite, s2: Sprite): boolean;
  period?: number;
}

export abstract class BaseCollisionStrategy implements CollisionStrategy {
  abstract isApplicable(s1: Sprite, s2: Sprite, dt: number): boolean;
  abstract handleCollision(s1: Sprite, s2: Sprite): boolean;

  constructor(public period: number = 0) {}

  protected withinPeriod(dt: number) {
    return dt % this.period === 0;
  }
}
