import Config from "../config";

import { Vector } from "../vector";
import { Ship } from "./ship";

export interface ShipSpeedAndLocation extends Sprite {
  updateShipInformation(ship: Ship): void;
}

const IndicatorWidth = 225;
const IndicatorHeight = 10;
const SpeedIndicatorX = 125;

export function ShipSpeedAndLocation() {
  return kontra.sprite({
    x: Config.canvasWidth - IndicatorWidth,
    y: Config.canvasHeight - IndicatorHeight,
    shipPosition: ``,
    speed: 0,
    updateShipInformation({ x, y, dx, dy }: Ship) {
      // would be cool to show the star system as well
      this.shipPosition = `(${x.toFixed(0)}, ${y.toFixed(0)})`;
      let magnitude = Vector.getMagnitude({ x: dx, y: dy });
      this.speed = magnitude;
    },
    render() {
      let formattedSpeed = (this.speed * 100).toFixed(0);
      let text = `${formattedSpeed} zork/s`;

      this.context.fillStyle = "white";
      this.context.font = `normal normal 12px monospace`;
      this.context.fillText(this.shipPosition, this.x, this.y);
      this.context.fillText(text, this.x + SpeedIndicatorX, this.y);
    }
  });
}
