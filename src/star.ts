import { Position, getCanvasPosition, isObjectOutOfBounds } from "./utils";

export default function createStar(
  x: number,
  y: number,
  cameraPosition: Position
) {
  return kontra.sprite({
    // create some variation in positioning
    x: x + (Math.random() * x) / 2,
    y: y + (Math.random() * y) / 2,
    type: "star",
    dx: 0,
    dy: 0,
    ttl: Infinity,
    alpha: Math.random().toFixed(2),
    update() {},
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);
      let size = 2;
      this.context.fillStyle = `rgba(255,255,255,${this.alpha})`;
      this.context.fillRect(position.x, position.y, size, size);
    }
  });
}
