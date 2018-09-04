import { radiansToDegrees } from "./utils";
import createBullet from "./bullet";
import { Vector } from "./vector";
import { Scene } from "./scenes/scene";

export enum BehaviorType {
  FollowSteady = "FollowSteady",
  Shoot = "Shoot"
}

export interface Behavior {
  type: BehaviorType;
  properties: BehaviorProperties;
  update(dt?: number): void;
  render?(): void;
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
    type: BehaviorType.Shoot,
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
  if (behavior.render) {
    sprite.render = after(sprite.render, behavior.render).bind(sprite);
  }
}

export function before(func: any, beforeFunc: any) {
  return function(...args: any[]) {
    beforeFunc.apply(this, args);
    func.apply(this, args);
  };
}

export function after(func: any, afterFunc: any) {
  return function(...args: any[]) {
    func.apply(this, args);
    afterFunc.apply(this, args);
  };
}
