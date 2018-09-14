import {
  Position,
  getCanvasPosition,
  degreesToRadians,
  isObjectOutOfSectorBounds
} from "./utils";
import { generateName } from "./names";
import { PlanetType, getPattern } from "./planet";
import { Draw } from "./draw";

export interface Sun extends Sprite {
  radius: number;
  damageOuterRadius: number;
  energyOuterRadius: number;
  dt: number;
}

export function createSun(
  position: Position,
  radius: number,
  cameraPosition: Position,
  sunName: string = generateName()
): Sun {
  //let textureWidth = Math.round(getValueInRange(radius * 2, radius * 2));
  //let textureHeight = Math.round(getValueInRange(radius * 2, radius * 2));

  let textureWidth = 100;
  let textureHeight = 100;

  // sun = visible star :)
  let sun = kontra.sprite({
    type: SpriteType.Sun,
    x: position.x,
    y: position.y,
    radius,
    damageOuterRadius: radius + 0.25 * radius,
    energyOuterRadius: 3 * radius,
    ttl: Infinity,
    dt: 0,
    rotation: 0,

    update(this: Sun) {
      this.rotation += 1 / 10;
    },
    render(this: Sun) {
      if (isObjectOutOfSectorBounds(this, cameraPosition)) return;

      let position = getCanvasPosition(this, cameraPosition);

      // #1. Actual planet and texture
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));

      Draw.fillCircle(
        this.context,
        0,
        0,
        this.radius,
        getPattern(textureWidth, textureHeight, PlanetType.Sun)
      );

      // #3. gradient to give it a 3d look
      let gradient = this.context.createRadialGradient(
        0,
        0,
        (3 * this.radius) / 4,
        0,
        0,
        this.radius
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.7)");
      Draw.fillCircle(this.context, 0, 0, this.radius, gradient);

      // Damage radius
      Draw.drawCircle(this.context, 0, 0, this.damageOuterRadius, "red", 1, [
        2,
        2
      ]);
      // Energy radius
      Draw.drawCircle(this.context, 0, 0, this.energyOuterRadius, "yellow", 1, [
        3,
        7
      ]);

      this.context.restore();

      // #4. sun name
      this.context.save();
      this.context.translate(position.x, position.y - radius - 45);
      let textOffset = (sunName.length / 2) * 10;
      Draw.fillText(this.context, sunName.toUpperCase(), -textOffset, 0);
      this.context.restore();
    }
  });

  return sun;
}
