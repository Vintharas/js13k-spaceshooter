import { Scene } from "../scenes/scene";
import Config from "../config";
import { Color, Position } from "../utils";
import { Vector } from "../vector";
import { ShipEnergy } from "./shipEnergy";
import { ShipSystem, ShipSystemMixin } from "./shipSystems";
import { Draw } from "../draw";

export interface ShipRadar extends Sprite, ShipSystem {
  isInRange(s: Sprite, cameraPosition: Position): boolean;
}

let RadarSize = 100;
let RadarRadius = 45;
let RadarRange = 1000;

// TODO: I should be able to optimize
// the performance of this when I divide
// the game into Galaxy/Sectors, etc
export function ShipRadar(scene: Scene, energy: ShipEnergy) {
  let radar = kontra.sprite({
    ...ShipSystemMixin(scene, "RADAR", (energy.maxEnergy * 4) / 6),

    // center of radar
    x: Config.canvasWidth - RadarSize / 2,
    y: RadarSize / 2,
    dt: 0,
    targetsInRadar: [],
    update(this: ShipRadar) {
      if (!this.isEnabled) return;

      this.dt += 1 / 60;
      // updates targets every second
      if (this.dt > 1) {
        this.dt = 0;
        this.targetsInRadar = [
          ...scene.sprites.foreground,
          ...scene.sprites.activePoolObjects()
        ]
          .filter((s: Sprite) => this.isInRange(s, scene.cameraPosition))
          .filter((s: Sprite) => s.radius > 15 || s.size > 10 || s.width > 10)
          .map((s: Sprite) => mapToTarget(s, scene.cameraPosition));

        /*
        if (Config.debug && Config.debugRadar)
          console.log(`Targets in radar: `, this.targetsInRadar);
        */
      }
    },
    render() {
      this.context.save();
      this.context.translate(this.x, this.y);
      // #1. render radar as concentric circles
      for (let r = RadarRadius; r > 15; r -= 5) {
        Draw.drawCircle(this.context, 0, 0, r, Color.rgba(255, 255, 255, 0.5));
      }
      this.context.closePath();

      // and two lines
      this.context.translate(-RadarSize / 2, 0);
      Draw.drawLine(this.context, 0, 0, RadarSize, 0);
      this.context.closePath();

      this.context.translate(RadarSize / 2, -RadarSize / 2);
      Draw.drawLine(this.context, 0, 0, 0, RadarSize);
      this.context.closePath();

      // #2. render targets
      if (this.isEnabled) {
        this.context.translate(0, RadarSize / 2);
        this.targetsInRadar.forEach((t: RadarTarget) => {
          Draw.fillCircle(this.context, t.x, t.y, t.size / 2, t.color);
        });
      }

      this.context.restore();
    },
    isInRange(sprite: Sprite, cameraPosition: Position) {
      let relativePosition = {
        x: sprite.x - cameraPosition.x,
        y: sprite.y - cameraPosition.y
      };
      let magnitude = Vector.getMagnitude(relativePosition);
      return magnitude < RadarRange;
    }
  });

  energy.subscribe(radar);

  return radar;
}

interface RadarTarget extends Position {
  color: string;
  size: number;
}

function mapToTarget(sprite: Sprite, cameraPosition: Position): RadarTarget {
  let relativePosition = {
    x: sprite.x - cameraPosition.x,
    y: sprite.y - cameraPosition.y
  };
  let normalizedRelativePosition = {
    x: relativePosition.x / RadarRange,
    y: relativePosition.y / RadarRange
  };

  return {
    x: normalizedRelativePosition.x * RadarRadius,
    y: normalizedRelativePosition.y * RadarRadius,
    color: typeToColor(sprite.type),
    size: toSize(sprite)
  };

  function typeToColor(type: SpriteType): string {
    if (type === SpriteType.Planet) return Color.rgba(0, 255, 0, 0.7);
    if (type === SpriteType.Asteroid) return Color.rgba(200, 200, 200, 0.7);
    if (type === SpriteType.Elder) return Color.rgba(255, 0, 0, 0.7);
    else return Color.rgba(150, 150, 150, 0.7);
  }
  function toSize(sprite: Sprite) {
    let maxTargetSize = 6;
    let maxRealSize = 100; // planet size, extract to config

    // TODO: remove this duplication
    let size = sprite.radius || sprite.size || sprite.width;
    return Math.ceil((size / maxRealSize) * maxTargetSize);
  }
}
