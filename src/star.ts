import {
  Position,
  getCanvasPosition,
  isObjectOutOfBounds,
  getNumberWithVariance,
  getValueInRange
} from "./utils";

export default function createStar(
  x: number,
  y: number,
  cameraPosition: Position
) {
  return kontra.sprite({
    // create some variation in positioning
    x: getNumberWithVariance(x, x / 2),
    y: getNumberWithVariance(y, y / 2),
    type: "star",
    dx: 0,
    dy: 0,
    ttl: Infinity,
    // doesn't make sense to get distance 1 because
    // it'd mean that it's too far again
    distance: getValueInRange(0, 1).toFixed(2),
    update() {},
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      // the more distant stars appear dimmer
      // limit alpha between 1 and 0.75
      let alpha = 1 - (3 * this.distance) / 4;
      let size = 2 + (1 - parseFloat(this.distance));
      // more distant stars are less affected by the camera position
      // that is, they move slower in reaction to the camera changing
      // this should work as a parallax effect of sorts.
      let position = getCanvasPosition(this, cameraPosition, this.distance);
      this.context.fillStyle = `rgba(255,255,255,${alpha})`;
      this.context.fillRect(position.x, position.y, size, size);
    }
  });
}
