import Config from "../config";
import { ShipEnergy } from "./shipEnergy";
import { Scene } from "../scenes/scene";
import { createGameStatusText } from "../text";
import { ShipSystem } from "./shipSystems";

export interface ShipVision extends Sprite, ShipSystem {
  isEnabled: boolean;
  disable(): void;
}

export function ShipVision(scene: Scene, energy: ShipEnergy) {
  let vision = kontra.sprite({
    isEnabled: true,
    dt: 0,
    disable() {
      this.isEnabled = false;
    },
    update() {
      this.dt += 1 / 60;
      if (this.dt > 0.25) {
        this.dt = 0;
        if (energy.energy < (energy.maxEnergy * 1) / 5 && this.isEnabled) {
          if (Config.debug) console.log("Low on energy. Disabling vision");
          this.disable();
          let textSprite = createGameStatusText("- NEAR SPACE RADAR OFFLINE -");
          scene.addSprite(textSprite);
        }
      }
    },
    onEnergyIncreased(currentEnergy: number) {
      if (currentEnergy > (energy.maxEnergy * 1) / 5 && !this.isEnabled) {
        this.isEnabled = true;
        let textSprite = createGameStatusText("- NEAR SPACE RADAR ONLINE -");
        scene.addSprite(textSprite);
      }
    },
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
