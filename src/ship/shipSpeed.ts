import Config from "../config";

import { Vector } from "../vector";

export interface ShipSpeed extends Sprite {
  updateSpeed(dx: number, dy: number): void;
}

export function ShipSpeed() {
  return kontra.sprite({
    x: Config.canvasWidth - 70,
    y: Config.canvasHeight - 10,
    speed: 0,
    updateSpeed(dx: number, dy: number) {
      let magnitude = Vector.getMagnitude(dx, dy);
      this.speed = magnitude;
    },
    render() {
      let formattedSpeed = (this.speed * 100).toFixed(0);
      let text = `${formattedSpeed} km/s`;

      this.context.fillStyle = "white";
      this.context.font = `normal normal 12px monospace`;
      this.context.fillText(text, this.x, this.y);
    }
  });
}
