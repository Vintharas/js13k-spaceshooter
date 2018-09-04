import { Ship } from "../ship/ship";
import Config from "../config";
import { getCanvasPosition, radiansToDegrees } from "../utils";
import { Vector } from "../vector";
import createBullet from "../bullet";
import { Scene } from "../scenes/scene";

export interface Elder extends Sprite {}

export function ElderPool(scene: Scene, ship: Ship): Pool {
  return kontra.pool({
    create() {
      let elder = kontra.sprite({
        // pass all properties ot the kontra.sprite ctor
        type: "elder",
        // the enemies will need to have a reference
        // to the ship so they know its location
        dt: 0,
        ship,
        render(this: Elder) {
          let position = getCanvasPosition(this, this.ship);

          this.context.save();
          this.context.translate(position.x, position.y);
          this.context.rotate((Math.PI * 1) / 4);
          this.context.fillStyle = "gray";
          this.context.fillRect(0, 0, 20, 20);
          this.context.restore();

          if (Config.debug && Config.showPath) {
            this.context.save();
            this.context.translate(position.x + 10, position.y + 10);
            this.context.beginPath();
            this.context.strokeStyle = "red";
            this.context.moveTo(0, 0);
            this.context.lineTo(this.dx * 20, this.dy * 20);
            this.context.stroke();
            this.context.restore();
          }
        }
      });

      composeBehavior(elder, FollowSteadyBehavior(ship));
      composeBehavior(elder, Shoot(scene, ship));

      return elder;
    },
    maxSize: Config.Elders.MaxNumber
  });
}

// TODO: refactor into reusable and composable behaviors
// later
export enum BehaviorType {
  FollowSteady = "FollowSteady",
  Shoot = "Shoot"
}

export interface Behavior {
  type: BehaviorType;
  properties: BehaviorProperties;
  update(dt?: number): void;
}
export interface BehaviorProperties {
  // any property
  [key: string]: any;
}

export function FollowSteadyBehavior(target: Sprite): Behavior {
  return {
    type: BehaviorType.FollowSteady,
    properties: {
      dtfs: 0
    },
    update(dt?: number) {
      this.dtfs += 1 / 60;
      let distanceToShip = Vector.getDistanceMagnitude(this, target);
      if (distanceToShip < 500 && this.dtfs > 0.25) {
        // follow target when it's close
        this.dtfs = 0;
        let speed = 2;
        let distance = Vector.getDistance(target, this);
        this.dx = (speed * distance.x) / distanceToShip;
        this.dy = (speed * distance.y) / distanceToShip;
      } else if (this.dtfs > 1) {
        // if the target goes further away
        // after a while stop
        this.dx = 0;
        this.dy = 0;
      }
    }
  };
}

export function Shoot(scene: Scene, target: Sprite): Behavior {
  return {
    type: BehaviorType.FollowSteady,
    properties: {
      dts: 0
    },
    update(dt?: number) {
      this.dts += 1 / 60;
      let distanceToShip = Vector.getDistanceMagnitude(this, target);
      if (this.dts > 0.5 && distanceToShip < 300) {
        this.dts = 0;
        let angle = radiansToDegrees(Math.atan2(this.dy, this.dx));
        const bullet = createBullet(this, this, angle, target, scene);
        scene.addSprite(bullet);
      }
    }
  };
}

export function composeBehavior(sprite: Sprite, behavior: Behavior) {
  Object.assign(sprite, behavior.properties);
  sprite.update = before(sprite.update, behavior.update).bind(sprite);
}

export function before(func: any, beforeFunc: any) {
  return function(...args: any[]) {
    beforeFunc.apply(this, args);
    func.apply(this, args);
  };
}
