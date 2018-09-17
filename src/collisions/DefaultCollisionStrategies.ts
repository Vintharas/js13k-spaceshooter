import { NoopCollisionStrategy } from "./NoopCollisionStrategy";
import { Scene } from "../scenes/scene";
import { BulletCollisionStrategy } from "./BulletCollisionStrategy";
import { AsteroidCollisionStrategy } from "./AsteroidCollisionStrategy";
import { ClaimedPlanetCollisionStrategy } from "./ClaimedPlanetCollisionStrategy";
import { UnclaimedPlanetCollisionStrategy } from "./UnclaimedPlanetCollisionStrategy";
import { SunCollisionStrategy } from "./SunCollisionStrategy";

export function DefaultCollisionStrategies(scene: Scene) {
  return [
    new BulletCollisionStrategy(scene),
    new AsteroidCollisionStrategy(scene),
    new ClaimedPlanetCollisionStrategy(scene),
    new UnclaimedPlanetCollisionStrategy(scene),
    new SunCollisionStrategy(scene),
    new NoopCollisionStrategy()
  ];
}
