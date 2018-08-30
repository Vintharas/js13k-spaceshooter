import { Scene } from "../scenes/scene";
import { ShipEnergy } from "./shipEnergy";
import Config from "../config";
import { degreesToRadians, Position } from "../utils";
import createBullet from "../bullet";
import { ShipSystem, ShipSystemMixin } from "./shipSystems";
import { createGameStatusText } from "../text";

export interface ShipWeapons extends Sprite, ShipSystem {
  isEnabled: boolean;
  disable(): void;
  updateShipInformation(
    position: Position,
    velocity: Velocity,
    rotation: number
  ): void;
}

export function ShipWeapons(scene: Scene, energy: ShipEnergy): ShipWeapons {
  let weapons = kontra.sprite({
    ...ShipSystemMixin(scene, "WEAPONS", (energy.maxEnergy * 2) / 5),

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
        this.dt > 0.25 &&
        energy.hasEnoughEnergy(Config.Ship.EnergyCost.Shoot)
      ) {
        this.dt = 0;

        // fire in the direction the ship is looking
        const cos = Math.cos(degreesToRadians(this.rotation));
        const sin = Math.sin(degreesToRadians(this.rotation));

        const bullet = createBullet(
          this.position,
          this.velocity,
          cos,
          sin,
          scene.cameraPosition,
          scene
        );
        scene.addSprite(bullet);
      }

      this.checkEnergyLeftAndDisable(energy.energy);
    }
  });

  energy.subscribe(weapons);

  return weapons;
}
