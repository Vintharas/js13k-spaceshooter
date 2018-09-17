import { Vector } from "../vector";

export interface CollisionMethod {
  haveCollided(s1: Sprite, s2: Sprite): boolean;
}

export const CollisionMethods = {
  CircleCollision: {
    haveCollided(s1: Sprite, s2: Sprite) {
      return Vector.getDistanceMagnitude(s1, s2) < s1.width / 2 + s2.width / 2;
    }
  }
};
