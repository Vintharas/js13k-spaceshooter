import { Ship } from "../ship/ship";
import Config from "../config";
import {
  Position,
  getCanvasPosition,
  getRandomValueOf,
  degreesToRadians,
  HSL,
  RGB
} from "../utils";
import { Scene } from "../scenes/scene";
import {
  composeBehavior,
  FollowSteadyBehavior,
  Shoot,
  PatrolAroundTarget,
  updateWasDamageStatus,
  PatrolType
} from "../behavior";
import OffscreenCanvas from "../canvas";
import { Draw } from "../draw";
import { after } from "../fp";

// Elder race of aliens jara, jara
// Using the elder name couldn't be more confusing XD
export interface Elder extends Sprite, ElderCharacteristics {
  elderType: ElderType;
}

export function ElderPool(scene: Scene, ship: Ship): Pool {
  let color = getElderColor();
  return kontra.pool({
    create() {
      let elder = kontra.sprite({
        // pass all properties ot the kontra.sprite ctor
        type: SpriteType.Elder,
        // the enemies will need to have a reference
        // to the ship so they know its location
        ship,
        life: 100,
        width: 20,

        // render
        color,
        pattern: getElderPattern(color),
        rotation: 45,

        // damage animation TODO: extract
        wasDamaged: false,

        // behaviors
        activeBehavior: undefined,

        update: after(function update() {
          this.advance();
          this.rotation += 0.5;
        }, updateWasDamageStatus()),
        takeDamage(damage: number) {
          // TODO: add take damage animation
          this.life -= damage;
          if (this.life < 0) this.ttl = 0;
          this.wasDamaged = true;
        },
        render(this: Elder) {
          let position = getCanvasPosition(this, this.ship);
          this.renderElder(position);

          /*
          // Show elder ship path
          if (Config.debug && Config.showPath) {
            this.context.save();
            Draw.drawLine(
              this.context,
              position.x,
              position.y,
              position.x + this.dx * 20,
              position.y + this.dy * 20,
              "red"
            );
            this.context.restore();
          }
          */

          /*
          // Show elder ship collision area
          if (Config.debug && Config.renderCollisionArea) {
            this.context.save();
            this.context.translate(position.x, position.y);
            this.context.rotate(degreesToRadians(this.rotation));
            Draw.drawCircle(this.context, 0, 0, this.width / 2, "red");
            this.context.restore();
          }
          */
        },
        init(args: any) {
          // load defaults based on type
          let elderType = args.elderType as ElderType;
          Object.assign(this, ElderCharacteristics[elderType]);
          Object.assign(this, args);
          if (this.elderType === ElderType.Sentry) {
            composeBehavior(elder, PatrolAroundTarget(PatrolType.Orbit, 200));
            composeBehavior(elder, FollowSteadyBehavior(ship, 300));
            composeBehavior(elder, Shoot(scene, ship));
          } else if (this.elderType === ElderType.Drone) {
            // change this behavior to follow fast
            composeBehavior(elder, PatrolAroundTarget(PatrolType.Random));
            composeBehavior(elder, FollowSteadyBehavior(ship, 400));
            composeBehavior(elder, Shoot(scene, ship));
          } else {
            // mothership
            composeBehavior(elder, FollowSteadyBehavior(ship, 300));
            composeBehavior(elder, Shoot(scene, ship));
          }
        }
      });
      return elder;
    },
    //maxSize: Config.Elders.MaxNumber
    maxSize: 100
  });
}

export const enum ElderType {
  Drone,
  Sentry,
  MotherShip
}

interface EldersCharacteristics {
  [ElderType.Drone]: ElderCharacteristics;
  [ElderType.Sentry]: ElderCharacteristics;
  [ElderType.MotherShip]: ElderCharacteristics;
}

interface ElderCharacteristics {
  width: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  life: number;
  damage: number;
  renderElder(this: Elder, position: Position): void;
}

let ElderCharacteristics: EldersCharacteristics = {
  [ElderType.Drone]: {
    width: 10,
    speed: 2,
    maxSpeed: 4,
    acceleration: 0.1,
    life: 50,
    damage: 10,
    renderElder(position: Position) {
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));
      this.context.strokeStyle = this.pattern;
      this.context.lineWidth = 3;
      this.context.strokeRect(
        -this.width / 2,
        -this.width / 2,
        this.width,
        this.width
      );
      if (this.wasDamaged) {
        this.context.globalCompositeOperation = "source-atop";
        this.context.fillStyle = "rgba(255,0,0,0.5)";
        this.context.fillRect(
          -this.width / 2,
          -this.width / 2,
          this.width,
          this.width
        );
      }
      this.context.restore();
    }
  },
  [ElderType.Sentry]: {
    width: 20,
    speed: 2,
    maxSpeed: 2,
    acceleration: 0, // move uniformly
    life: 100,
    damage: 30,
    renderElder(position: Position) {
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));
      this.context.fillStyle = this.pattern;
      this.context.fillRect(
        -this.width / 2,
        -this.width / 2,
        this.width,
        this.width
      );
      if (this.wasDamaged) {
        this.context.globalCompositeOperation = "source-atop";
        this.context.fillStyle = "rgba(255,0,0,0.5)";
        this.context.fillRect(
          -this.width / 2,
          -this.width / 2,
          this.width,
          this.width
        );
      }
      this.context.restore();
    }
  },
  [ElderType.MotherShip]: {
    width: 100,
    speed: 0.5,
    maxSpeed: 1,
    acceleration: 0, // move uniformly
    life: 500,
    damage: 100,
    renderElder(position: Position) {
      // 1. draw main body
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));
      this.context.fillStyle = this.pattern;
      this.context.fillRect(
        -this.width / 4,
        -this.width / 4,
        this.width / 2,
        this.width / 2
      );
      // outer ring is rotating faster than the inner one
      this.context.rotate(degreesToRadians(this.rotation + 1.5));
      Draw.drawCircle(
        this.context,
        0,
        0,
        this.width / 2,
        this.pattern,
        /*line width*/ 5
      );
      if (this.wasDamaged) {
        this.context.globalCompositeOperation = "source-atop";
        this.context.fillStyle = "rgba(255,0,0,0.5)";
        this.context.fillRect(
          -this.width / 2 - 10,
          -this.width / 2 - 10,
          this.width + 20,
          this.width + 20
        );
      }
      this.context.restore();
    }
  }
};

export let ElderColors = {
  grey: { h: 0, s: 0, l: 50 },
  granate: { h: 295, s: 100, l: 50, r: 243, g: 0, b: 255 },
  green: { h: 120, s: 100, l: 50, r: 0, g: 255, b: 0 }
};

function getElderColor(): HSL & RGB {
  let granate = { h: 295, s: 100, l: 50, r: 243, g: 0, b: 255 };
  let green = { h: 120, s: 100, l: 50, r: 0, g: 255, b: 0 };
  let accent = getRandomValueOf([granate, green]);
  return accent;
}

function getElderPattern(accent: HSL) {
  let grey = { h: 0, s: 0, l: 50 };
  let pattern = OffscreenCanvas.instance().getPatternBasedOnColors(
    grey,
    accent,
    //Config.Textures.Elder,
    //Config.Textures.Elder
    20,
    20
  );
  return pattern;
}
// TODO: could have a couple of patterns with purple and phosphorecent green
// or something like that
