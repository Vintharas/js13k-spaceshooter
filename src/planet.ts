import {
  Position,
  getCanvasPosition,
  isObjectOutOfBounds,
  Sprite,
  degreesToRadians,
  getValueInRange
} from "./utils";
import OffscreenCanvas from "./canvas";
import Config from "./config";
import { getRandomCellType } from "./cell";
import { generateName } from "./names";

export interface Planet extends Sprite {
  radius: number;
  outerRadius: number;
  dt: number;
}

export function createPlanet(
  position: Position,
  radius: number,
  cameraPosition: Position
): Planet {
  let textureWidth = Math.round(getValueInRange(64, radius));
  let textureHeight = Math.round(getValueInRange(64, radius));
  let planetType = getPlanetType();
  let planetName = generateName();

  let planet = kontra.sprite({
    type: "planet",
    x: position.x,
    y: position.y,
    radius,
    outerRadius: radius + 0.25 * radius,
    ttl: Infinity,
    dt: 0,
    rotation: 0,
    update() {
      this.rotation += 1 / 4;
    },
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      // #1. Actual planet and texture
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));

      this.context.fillStyle = this.getPattern(
        textureWidth,
        textureHeight,
        planetType
      );
      this.context.beginPath(); // start drawing a shape
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.fill(); // outline the circle

      // #2. Add some clouds
      /* TODO: improve this
      this.context.fillStyle = this.getCloudPattern(planetType);
      this.context.beginPath(); // start drawing a shape
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.fill(); // outline the circle
      */

      // #3. gradient to give it a 3d look
      this.context.beginPath(); // start drawing a shape
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
      this.context.fillStyle = gradient;
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.fill();

      // #3. radius where you can start collecting stuff
      this.context.beginPath(); // start drawing a shape
      this.context.strokeStyle = "turquoise";
      this.context.setLineDash([3, 7]);
      this.context.arc(0, 0, this.outerRadius, 0, Math.PI * 2);
      this.context.stroke();

      this.context.restore();

      this.context.save();

      // #4. planet name
      this.context.translate(position.x, position.y - radius - 35);
      this.context.fillStyle = "rgba(255,255,255,0.8)";
      this.context.font = `normal normal 14px monospace`;
      let textOffset = (planetName.length / 2) * 10;
      this.context.fillText(planetName.toUpperCase(), -textOffset, 0);

      this.context.restore();

      // #5. planet energy

      // Drawing asteroids as a circle
      // this is what we use for collision
      // useful for debugging
      if (Config.debug && Config.renderCollisionArea) {
      }
    },
    getPattern(width: number, height: number, type: PlanetType) {
      let color = PlanetBaseColors[type];
      return OffscreenCanvas.instance().getPatternBasedOnColor(
        color.h,
        color.s,
        color.l,
        textureWidth,
        textureHeight,
        3
      );
    },
    getCloudPattern(type: PlanetType) {
      let color = PlanetBaseColors[type];
      let cloudColor = { ...color };
      cloudColor.l += 50; // lighter color for clouds
      return OffscreenCanvas.instance().getPatternWithTransparency(
        cloudColor,
        radius,
        radius,
        3
      );
    }
  });

  return planet;
}

export enum PlanetType {
  Red = 0,
  Green = 1,
  Blue = 2
}
export const PlanetBaseColors = [
  /*Red*/ { h: 0, s: 70, l: 45 },
  /*Green*/ { h: 120, s: 100, l: 39 },
  /*Blue*/ { h: 195, s: 100, l: 50 }
];

function getPlanetType(): PlanetType {
  // TODO: extract thiiiiiis, I've used this pattern a thousand times now
  const index = Math.round(getValueInRange(0, 2));
  const types = [PlanetType.Red, PlanetType.Green, PlanetType.Blue];
  return types[index];
}
