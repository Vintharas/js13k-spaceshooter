import { NoopCollisionStrategy } from "./NoopCollisionStrategy";
import { Scene } from "../scenes/scene";
import { BulletCollisionStrategy } from "./BulletCollisionStrategy";
import { AsteroidCollisionStrategy } from "./AsteroidCollisionStrategy";

export function DefaultCollisionStrategies(scene: Scene) {
  return [
    new BulletCollisionStrategy(scene),
    new AsteroidCollisionStrategy(scene),
    new NoopCollisionStrategy()
  ];
}
