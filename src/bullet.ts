import { Position, getCanvasPosition, Velocity } from "./utils";

export default function createBullet(
  position: Position,
  velocity: Velocity,
  cos: number,
  sin: number,
  cameraPosition: Position
) {
  return kontra.sprite({
    type: "bullet",
    // start the bullet on the ship at the end of the triangle
    x: position.x + cos * 12,
    y: position.y + sin * 12,
    // move the bullet slightly faster than the ship
    dx: velocity.dx + cos * 5,
    dy: velocity.dy + sin * 5,
    // live only 50 frames
    ttl: 50,
    // bullets are small
    width: 2,
    height: 2,
    color: "white",
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      this.context.fillStyle = this.color;
      this.context.fillRect(position.x, position.y, this.width, this.height);
    }
  });
}
