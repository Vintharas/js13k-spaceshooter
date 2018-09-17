import { BaseCollisionStrategy } from "./CollisionStrategy";
import { CollisionMethods } from "./CollisionMethods";
import { Scene } from "../scenes/scene";
import { Explosion } from "../effects/explosion";
import { Sun } from "../sun";
import { Ship } from "../ship/ship";
import { getValueInRange, RGB } from "../utils";
import Config from "../config";
import { createText } from "../text";

export class SunCollisionStrategy extends BaseCollisionStrategy {
  private haveCollided = CollisionMethods.ObjectWithinRadius.haveCollided;
  period = 0.4;

  constructor(private scene: Scene) {
    super(/* period */ 0.4);
  }

  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return (
      this.withinPeriod() && (isSunAndShip(s1, s2) || isSunAndShip(s2, s1))
    );
  }

  handleCollision(s1: Sprite, s2: Sprite): boolean {
    this.resetTicker();
    if (s1.type === SpriteType.Sun)
      return this.handleCollisionBetweenSunAndShip(s1 as Sun, s2 as Ship);
    else return this.handleCollisionBetweenSunAndShip(s2 as Sun, s1 as Ship);
  }

  handleCollisionBetweenSunAndShip(sun: Sun, ship: Ship): boolean {
    if (this.haveCollided(sun, ship, sun.damageOuterRadius)) {
      if (ship.ttl > 0) {
        ship.takeDamage(100);
        if (ship.ttl === 0) {
          this.addExplosion(this.scene, ship);
        }
      }
      return true;
    } else if (this.haveCollided(sun, ship, sun.energyOuterRadius)) {
      // provide energy boost
      this.provideEnergyBoost(ship, /*modifier*/ 3);
      return true;
    }
    return false;
  }

  addExplosion(scene: Scene, sprite: Sprite) {
    let explosion = Explosion(scene, sprite);
    for (let particle of explosion.particles) scene.addSprite(particle);
  }

  provideEnergyBoost(ship: Ship, modifier = 1) {
    let energyBoost = Math.ceil(
      getValueInRange(0, Config.Cell.EnergyBoost * modifier)
    );
    ship.energy.recharge(energyBoost);
    this.addBoostText(energyBoost, ship, ship, { r: 0, g: 255, b: 0 });
  }

  addBoostText(
    boost: number,
    position: Position,
    cameraPosition: Position,
    color: RGB
  ) {
    let cellText = createText(
      `+${boost}`,
      position,
      {
        velocity: { dx: 0, dy: -1 },
        ttl: 120,
        color,
        cameraPosition
      },
      { size: 12, family: "monospace" }
    );
    this.scene.addSprite(cellText);
  }
}

function isSunAndShip(s1: Sprite, s2: Sprite) {
  return s1.type === SpriteType.Sun && s2.type === SpriteType.Ship;
}
