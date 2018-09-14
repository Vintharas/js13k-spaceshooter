import {
  getCanvasPosition,
  getNumberWithVariance,
  getValueInRange,
  Color
} from "./utils";
import Config from "./config";

export interface StarBuilder extends SpriteBuilder {}
export interface Star extends Sprite {}

export function createStar({ x, y, cameraPosition }: StarBuilder) {
  let distance = getValueInRange(0, 1).toFixed(2);
  let alpha: number = 1 - (3 * parseFloat(distance)) / 4;
  let color = Color.get(alpha);
  let size: number = 2.5 + (1 - parseFloat(distance));

  return kontra.sprite({
    // create some variation in positioning
    x: getNumberWithVariance(x, x / 2),
    y: getNumberWithVariance(y, y / 2),
    type: SpriteType.Star,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    // doesn't make sense to get distance 1 because
    // it'd mean that it's too far again
    distance,
    color,
    size,
    update() {},
    render() {
      /*
      if (isObjectOutOfRenderBounds(this, cameraPosition)) {
        //console.log(`star out of bounds `, this);
        return;
      }
      */
      // the more distant stars appear dimmer
      // limit alpha between 1 and 0.75
      // more distant stars are less affected by the camera position
      // that is, they move slower in reaction to the camera changing
      // this should work as a parallax effect of sorts.
      let position = getCanvasPosition(this, cameraPosition, this.distance);
      this.context.fillStyle = this.color;
      this.context.fillRect(position.x, position.y, this.size, this.size);
    }
  });
}
