import { Vector } from "../vector";

export interface CollisionMethod {
  haveCollided(s1: Sprite, s2: Sprite): boolean;
}

export const CollisionMethods = {
  CircleCollision: {
    haveCollided(s1: Sprite, s2: Sprite) {
      const r1 = getRadius(s1);
      const r2 = getRadius(s2);
      return Vector.getDistanceMagnitude(s1, s2) < r1 + r2;
    }
  }
};

function getRadius(s: Sprite) {
  // TODO: it'd be nice to have a unified API for all sprites
  // to measure size and calculate collisions
  return s.collisionWidth || s.outerRadius || s.radius || s.width / 2;
}
