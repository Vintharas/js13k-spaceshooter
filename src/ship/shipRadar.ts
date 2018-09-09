import { Scene } from "../scenes/scene";
import Config from "../config";
import { Color, Position } from "../utils";
import { Vector } from "../vector";
import { ShipEnergy } from "./shipEnergy";
import { ShipSystem, ShipSystemMixin } from "./shipSystems";

export interface ShipRadar extends Sprite, ShipSystem {
  isInRange(s: Sprite, cameraPosition: Position): boolean;
}

// TODO: I should be able to optimize
// the performance of this when I divide
// the game into Galaxy/Sectors, etc
export function ShipRadar(scene: Scene, energy: ShipEnergy) {
  let radar = kontra.sprite({
    ...ShipSystemMixin(scene, "RADAR", (energy.maxEnergy * 4) / 6),

    // center of radar
    x: Config.canvasWidth - Config.Ship.Radar.Size / 2,
    y: Config.Ship.Radar.Size / 2,
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

        if (Config.debug && Config.debugRadar)
          console.log(`Targets in radar: `, this.targetsInRadar);
      }
    },
    render() {
      this.context.save();
      this.context.translate(this.x, this.y);
      // #1. render radar as concentric circles
      for (let r = Config.Ship.Radar.Radius; r > 15; r -= 5) {
        this.context.beginPath();
        this.context.strokeStyle = Color.rgba(255, 255, 255, 0.5);
        this.context.arc(0, 0, r, 0, 2 * Math.PI);
        this.context.stroke();
      }
      this.context.closePath();

      // and two lines
      this.context.translate(-Config.Ship.Radar.Size / 2, 0);
      this.context.beginPath();
      this.context.moveTo(0, 0);
      this.context.lineTo(Config.Ship.Radar.Size, 0);
      this.context.stroke();
      this.context.closePath();

      this.context.translate(
        Config.Ship.Radar.Size / 2,
        -Config.Ship.Radar.Size / 2
      );
      this.context.beginPath();
      this.context.moveTo(0, 0);
      this.context.lineTo(0, Config.Ship.Radar.Size);
      this.context.stroke();
      this.context.closePath();

      // #2. render targets
      if (this.isEnabled) {
        this.context.translate(0, Config.Ship.Radar.Size / 2);
        this.targetsInRadar.forEach((t: RadarTarget) => {
          this.context.fillStyle = t.color;
          //this.context.fillRect(t.x, t.y, t.size, t.size);
          this.context.beginPath();
          this.context.arc(t.x, t.y, t.size / 2, 0, 2 * Math.PI);
          this.context.fill();
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
      return magnitude < Config.Ship.Radar.Range;
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
    x: relativePosition.x / Config.Ship.Radar.Range,
    y: relativePosition.y / Config.Ship.Radar.Range
  };

  return {
    x: normalizedRelativePosition.x * Config.Ship.Radar.Radius,
    y: normalizedRelativePosition.y * Config.Ship.Radar.Radius,
    color: typeToColor(sprite.type),
    size: toSize(sprite)
  };

  // TODO: Why not use enums for types?
  function typeToColor(type: string): string {
    if (type === "planet") return Color.rgba(0, 255, 0, 0.7);
    if (type === "asteroid") return Color.rgba(200, 200, 200, 0.7);
    if (type === "elder") return Color.rgba(255, 0, 0, 0.7);
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
