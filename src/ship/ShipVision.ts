import Config from "../config";
import { ShipEnergy } from "./shipEnergy";

export interface ShipVision extends Sprite {
  isEnabled: boolean;
  disable(): void;
}

export function ShipVision(energy: ShipEnergy) {
  let vision = kontra.sprite({
    isEnabled: true,
    disable() {
      this.isEnabled = false;
    },
    render(this: Sprite) {
      if (!this.isEnabled) {
        this.context.save();
        this.context.translate(Config.canvasWidth / 2, Config.canvasHeight / 2);
        this.context.beginPath();

        let gradient = this.context.createRadialGradient(
          0,
          0,
          Math.max(Config.canvasWidth, Config.canvasHeight) / 2,
          0,
          0,
          Math.max(Config.canvasWidth, Config.canvasHeight)
        );
        gradient.addColorStop(0, "rgba(0,0,0,0.5)");
        gradient.addColorStop(1, "rgba(0,0,0,0.9)");
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
  energy.vision = vision;
  return vision;
}
