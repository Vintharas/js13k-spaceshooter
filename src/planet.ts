import {
  Position,
  getCanvasPosition,
  isObjectOutOfBounds,
  degreesToRadians,
  getValueInRange,
  Positions,
  Color
} from "./utils";
import OffscreenCanvas from "./canvas";
import Config from "./config";
import { generateName } from "./names";
import { Faction } from "./factions";
import { createGameStatusText } from "./text";
import { Scene } from "./scenes/scene";

export interface Planet extends Sprite {
  radius: number;
  outerRadius: number;

  origin: Position;
  angle: number;
  orbit: number;

  claimedBy: Faction;
  increaseClaim(faction: Faction, percentage: number): void;
}
export interface PlanetOptions {
  drawOuterRadius?: boolean;
}

export function createPlanet(
  origin: Position,
  orbit: number,
  radius: number,
  cameraPosition: Position,
  scene: Scene,
  { drawOuterRadius = true }: PlanetOptions = {},
  planetType: PlanetType = getPlanetType(),
  planetName: string = generateName()
): Planet {
  //let textureWidth = Math.round(getValueInRange(64, radius));
  //let textureHeight = Math.round(getValueInRange(64, radius));
  let textureWidth = Config.Textures.Planet;
  let textureHeight = Config.Textures.Planet;

  // sun orbit
  let startingAngle = getValueInRange(0, 360);
  let startingPosition = Positions.inCircleGivenAngle(
    origin,
    orbit,
    startingAngle
  );
  let da = getValueInRange(0, 0.05);

  let planet = kontra.sprite({
    type: "planet",

    origin,
    orbit,
    x: startingPosition.x,
    y: startingPosition.y,
    radius,
    outerRadius: radius + 0.25 * radius,

    ttl: Infinity,

    angle: startingAngle,
    da,
    rotation: getValueInRange(0, Math.PI),

    // TODO: I could extract this into mixins
    // claiming logic
    claimedBy: undefined,
    beingClaimed: false, // controls whether the claiming
    claimedPercentage: 0,
    isClaimed() {
      return this.claimedBy !== undefined;
    },
    increaseClaim(faction: Faction, percentage: number): void {
      if (!this.beingClaimed) {
        // text
        let textSprite = createGameStatusText(
          `${faction} FACTION CLAIMING ${planetName}`
        );
        scene.addSprite(textSprite);
        this.beingClaimed = true;
      }

      this.claimedPercentage += percentage;

      if (this.claimedPercentage >= 100) {
        this.claimedPercentage = 100;
        this.beingClaimed = false;
        this.claimedBy = faction;
        let textSprite = createGameStatusText(
          `${faction} FACTION CLAIMED ${planetName}`
        );
        scene.addSprite(textSprite);
      }
    },

    // collecting logic
    beingCollected: false,
    resources: Config.Planet.Resources,

    update() {
      this.rotation += 1 / 4;
      this.angle += this.da;

      let newPosition = Positions.inCircleGivenAngle(
        this.origin,
        orbit,
        this.angle
      );
      this.x = newPosition.x;
      this.y = newPosition.y;
    },
    render(this: Planet) {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      // #0. planet orbit around sun
      this.context.save();
      let originInCanvas = getCanvasPosition(this.origin, cameraPosition);
      this.context.translate(originInCanvas.x, originInCanvas.y);
      this.context.strokeStyle = "rgba(255,255,255,0.15";
      this.context.beginPath();
      this.context.arc(0, 0, this.orbit, 0, 2 * Math.PI);
      this.context.stroke();
      this.context.restore();

      // #1. Actual planet and texture
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));

      this.context.fillStyle = getPattern(
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
      if (drawOuterRadius) {
        this.context.beginPath(); // start drawing a shape
        this.context.strokeStyle = "turquoise";
        this.context.setLineDash([3, 7]);
        this.context.arc(0, 0, this.outerRadius, 0, Math.PI * 2);
        this.context.stroke();
      }
      this.context.restore();

      // #4. planet name
      this.context.save();
      this.context.translate(position.x, position.y - radius - 45);
      this.context.fillStyle = "rgba(255,255,255,0.8)";
      this.context.font = `normal normal 14px monospace`;
      let textOffset = (planetName.length / 2) * 10;
      this.context.fillText(planetName.toUpperCase(), -textOffset, 0);
      this.context.restore();

      // #5. planet energy

      // #6. planet being claimed
      if (this.beingClaimed) {
        // extract to separate function
        // we can use the same bar for energy and claiming
        // just different colors
        // I can even use it for bars of energy, etc
        // it should be a separate UI game component
        let barWidth = radius * 2;
        let width = (this.claimedPercentage / 100) * barWidth;
        this.context.save();
        this.context.translate(position.x - radius, position.y + radius + 35);
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, width, 5);
        this.context.strokeStyle = "white";
        this.context.strokeRect(0, 0, radius * 2, 5);
        this.context.restore();
      }

      // #7. planet claimed
      if (this.claimedBy !== undefined) {
        let factionRadius = radius + 0.35 * radius;
        this.context.save();
        this.context.translate(position.x, position.y);
        let color = Config.Factions[this.claimedBy].Color;
        this.context.strokeStyle = Color.rgb(color);
        this.claimedBy.toLowerCase();
        this.context.lineWidth = 5;
        this.context.beginPath(); // start drawing a shape

        this.context.arc(0, 0, factionRadius, 0, Math.PI * 2);
        this.context.stroke();
        this.context.restore();
      }
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
  Blue = 2,
  Desert = 3,
  Barren = 4,
  Paradise = 5,
  Sun = 6
}
export const PlanetTypes = [
  PlanetType.Red,
  PlanetType.Green,
  PlanetType.Blue,
  PlanetType.Desert,
  PlanetType.Barren,
  PlanetType.Paradise
];
export const PlanetBaseColors = [
  /*Red*/ { h: 0, s: 70, l: 45 },
  /*Green*/ { h: 120, s: 100, l: 39 },
  /*Blue*/ { h: 195, s: 100, l: 50 },
  /*Desert*/ { h: 195, s: 100, l: 50 }, //TODO
  /*Barren*/ { h: 195, s: 100, l: 50 }, //TODO
  /*Paradise*/ { h: 195, s: 100, l: 50 }, //TODO
  /*Sun*/ { h: 60, s: 100, l: 50 }
];

function getPlanetType(): PlanetType {
  // TODO: extract thiiiiiis, I've used this pattern a thousand times now
  const index = Math.round(getValueInRange(0, 2));
  const types = [PlanetType.Red, PlanetType.Green, PlanetType.Blue];
  return types[index];
}

export function getPattern(width: number, height: number, type: PlanetType) {
  let color = PlanetBaseColors[type];
  return OffscreenCanvas.instance().getPatternBasedOnColor(
    color.h,
    color.s,
    color.l,
    width,
    height,
    3
  );
}
