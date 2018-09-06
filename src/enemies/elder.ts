import { Ship } from "../ship/ship";
import Config from "../config";
import {
  Position,
  getCanvasPosition,
  getRandomValueOf,
  degreesToRadians
} from "../utils";
import { Scene } from "../scenes/scene";
import {
  composeBehavior,
  FollowSteadyBehavior,
  Shoot,
  Behavior,
  PatrolAroundTarget
} from "../behavior";
import OffscreenCanvas from "../canvas";
import { Draw } from "../draw";

// Elder race of aliens jara, jara
// Using the elder name couldn't be more confusing XD
export interface Elder extends Sprite, ElderCharacteristics {
  elderType: ElderType;
}

export function ElderPool(scene: Scene, ship: Ship): Pool {
  return kontra.pool({
    create() {
      let elder = kontra.sprite({
        // pass all properties ot the kontra.sprite ctor
        type: "enemy",
        // the enemies will need to have a reference
        // to the ship so they know its location
        ship,
        life: 100,
        width: 20,

        // render
        pattern: getElderPattern(),
        rotation: 45,

        // damage animation TODO: extract
        dwd: 0,
        wasDamaged: false,

        // behaviors
        activeBehavior: undefined,

        update() {
          if (this.wasDamaged) {
            // TODO: extract this pattern
            // (increase counter and do something after a specific period of time)
            this.dwd += 1 / 60;
            if (this.dwd > 0.25) {
              this.wasDamaged = false;
              this.dwd = 0;
            }
          }
          this.advance();
          this.rotation += 0.5;
        },
        takeDamage(damage: number) {
          // TODO: add take damage animation
          this.life -= damage;
          if (this.life < 0) this.ttl = 0;
          this.wasDamaged = true;
        },
        render(this: Elder) {
          let position = getCanvasPosition(this, this.ship);
          this.renderElder(position);

          if (Config.debug && Config.showPath) {
            this.context.save();
            this.context.translate(position.x, position.y);
            Draw.drawLine(
              this.context,
              0,
              0,
              this.dx * 20,
              this.dy * 20,
              "red"
            );
            this.context.restore();
          }

          // TODO: looks like the collision algo
          // uses width as radius instead of width/2
          // creating a much bigger collision area than expected
          // reduce that to be the actual width/2 and test that it works
          if (Config.debug && Config.renderCollisionArea) {
            this.context.save();
            this.context.translate(position.x, position.y);
            this.context.rotate(degreesToRadians(this.rotation));
            Draw.drawCircle(this.context, 0, 0, this.width / 2, "red");
            this.context.restore();
          }
        },
        init(args: any) {
          // load defaults based on type
          let elderType = args.elderType as ElderType;
          Object.assign(this, ElderCharacteristics[elderType]);
          Object.assign(this, args);
          if (this.elderType === ElderType.Sentry) {
            composeBehavior(elder, PatrolAroundTarget(/* orbit */ 300));
            composeBehavior(elder, FollowSteadyBehavior(ship));
            composeBehavior(elder, Shoot(scene, ship));
          } else if (this.elderType === ElderType.Drone) {
          } else {
            // mothership
            composeBehavior(elder, FollowSteadyBehavior(ship));
            composeBehavior(elder, Shoot(scene, ship));
          }
        }
      });
      return elder;
    },
    maxSize: Config.Elders.MaxNumber
  });
}

export enum ElderType {
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

const ElderCharacteristics: EldersCharacteristics = {
  [ElderType.Drone]: {
    width: 10,
    speed: 4,
    maxSpeed: 6,
    acceleration: 0.1,
    life: 50,
    damage: 10,
    renderElder(position: Position) {}
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
    speed: 1,
    maxSpeed: 1,
    acceleration: 0, // move uniformly
    life: 500,
    damage: 100,
    renderElder(position: Position) {
      // TODO: for this and sentry
      // the position should be the center of the ship
      // and not
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
      this.context.restore();
    }
  }
};

function getElderPattern() {
  let grey = { h: 0, s: 0, l: 50 };
  let granate = { h: 295, s: 100, l: 50 };
  let green = { h: 120, s: 100, l: 50 };
  let accent = getRandomValueOf([granate, green]);
  let pattern = OffscreenCanvas.instance().getPatternBasedOnColors(
    grey,
    accent,
    20,
    20
  );
  return pattern;
}
// TODO: could have a couple of patterns with purple and phosphorecent green
// or something like that
