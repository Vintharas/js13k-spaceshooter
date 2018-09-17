import { CollisionStrategy } from "./CollisionStrategy";

/* Catch all strategy */
export class NoopCollisionStrategy implements CollisionStrategy {
  updateTicker(dt: number): void {}
  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return true;
  }

  handleCollision(s1: Sprite, s2: Sprite): boolean {
    return false;
  }
}
