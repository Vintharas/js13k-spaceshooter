import Config from "../config";

import { Vector } from "../vector";
import { Ship } from "./ship";
import { Draw } from "../draw";

export interface ShipSpeedAndLocation extends Sprite {
  updateShipInformation(ship: Ship): void;
}

let IndicatorWidth = 225;
let IndicatorHeight = 10;
let SpeedIndicatorX = 125;

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

      Draw.fillText(this.context, this.shipPosition, this.x, this.y);
      Draw.fillText(this.context, text, this.x + SpeedIndicatorX, this.y);
    }
  });
}
