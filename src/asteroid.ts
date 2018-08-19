import {
  Position,
  getCanvasPosition,
  isObjectOutOfBounds,
  Velocity
} from "./utils";
import Config from "./config";

export function createAsteroid(
  position: Position,
  velocity: Velocity,
  radius: number,
  cameraPosition: Position
) {
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
    }
  });

  return asteroid;
}
