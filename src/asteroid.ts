import { Position, getCanvasPosition, isObjectOutOfBounds } from "./utils";
import Config from "./config";

export function createAsteroid(
  x: number,
  y: number,
  radius: number,
  cameraPosition: Position
) {
  let asteroid = kontra.sprite({
    type: "asteroid",
    x: x,
    y: y,
    radius: radius,
    ttl: Infinity,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    dt: 0,
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);
      this.context.strokeStyle = "white";
      this.context.beginPath(); // start drawing a shape
      this.context.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
      this.context.stroke(); // outline the circle
    }
  });

  return asteroid;
}
