import Config from "../config";
import { ShipEnergy } from "./shipEnergy";
import { Scene } from "../scenes/scene";
import { createGameStatusText } from "../text";
import { ShipSystem, ShipSystemMixin } from "./shipSystems";

export interface ShipVision extends Sprite, ShipSystem {}

export function ShipVision(scene: Scene, energy: ShipEnergy) {
  let vision = kontra.sprite({
    ...ShipSystemMixin(scene, "NEAR SPACE RADAR", (energy.maxEnergy * 1) / 6),

    dt: 0,
    render(this: Sprite) {
      if (!this.isEnabled) {
        this.context.save();
        this.context.translate(Config.canvasWidth / 2, Config.canvasHeight / 2);
        this.context.beginPath();

        let gradient = this.context.createRadialGradient(
          0,
          0,
          Math.min(Config.canvasWidth, Config.canvasHeight) / 8,
          0,
          0,
          (Math.max(Config.canvasWidth, Config.canvasHeight) * 3) / 4
        );
        gradient.addColorStop(0, "rgba(0,0,0,0.2)");
        gradient.addColorStop(1, "rgba(0,0,0,1)");
        this.context.fillStyle = gradient;
        this.context.arc(
          0,
          0,
          Math.max(Config.canvasWidth, Config.canvasHeight),
          0,
          2 * Math.PI
        );
        this.context.fill();
        this.context.restore();
      }
    }
  });
  energy.subscribe(vision);
  return vision;
}
