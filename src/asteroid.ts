import {
  Position,
  getCanvasPosition,
  isObjectOutOfBounds,
  Velocity,
  Sprite
} from "./utils";
import OffscreenCanvas from "./canvas";

export interface Asteroid extends Sprite {
  radius: number;
  ttl: number;
  dt: number;
}

export function createAsteroid(
  position: Position,
  velocity: Velocity,
  radius: number,
  cameraPosition: Position
): Asteroid {
  let asteroid = kontra.sprite({
    type: "asteroid",
    x: position.x,
    y: position.y,
    radius: radius,
    ttl: Infinity,
    dx: velocity.dx,
    dy: velocity.dy,
    dt: 0,
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);
      this.context.strokeStyle = "white";
      this.context.beginPath(); // start drawing a shape
      this.context.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
      this.context.stroke(); // outline the circle
      this.context.fillStyle = OffscreenCanvas.instance().getPattern();
      this.context.fill(); // fill circle
    }
  });

  return asteroid;
}
