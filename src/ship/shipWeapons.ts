import { Scene } from "../scenes/scene";
import { ShipEnergy } from "./shipEnergy";
import Config from "../config";
import { Position, RGB } from "../utils";
import createBullet from "../bullet";
import { ShipSystem, ShipSystemMixin } from "./shipSystems";

export interface ShipWeapons extends Sprite, ShipSystem {
  isEnabled: boolean;
  disable(): void;
  updateShipInformation(
    position: Position,
    velocity: Velocity,
    rotation: number
  ): void;
}

export function ShipWeapons(
  scene: Scene,
  energy: ShipEnergy,
  modifier = 0,
  color: RGB = { r: 255, g: 255, b: 255 }
): ShipWeapons {
  let weapons = kontra.sprite({
    ...ShipSystemMixin(scene, "WEAPONS", (energy.maxEnergy * 2) / 5),

    // this is necessary so that bullets won't collide with the ship
    ship: undefined,
    dt: 0,
    rotation: 0,
    position: { x: 0, y: 0 },
    velocity: { dx: 0, dy: 0 },
    updateShipInformation(
      position: Position,
      velocity: Velocity,
      rotation: number
    ) {
      this.position = position;
      this.velocity = velocity;
      this.rotation = rotation;
    },
    update(this: ShipWeapons) {
      if (!this.isEnabled) return;
      // allow the player to fire no more than 1 bullet every 1/4 second
      this.dt += 1 / 60;
      if (
        kontra.keys.pressed("space") &&
        this.dt > 0.25 + modifier &&
        energy.hasEnoughEnergy(Config.Ship.EnergyCost.Shoot)
      ) {
        this.dt = 0;

        const bullet = createBullet(
          this.position,
          this.velocity,
          this.rotation,
          scene.cameraPosition,
          scene,
          /* owner */ this.ship,
          10, // TODO: add faction modifier
          color
        );
        scene.addSprite(bullet);
      }
    }
  });

  energy.subscribe(weapons);

  return weapons;
}
