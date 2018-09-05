import { radiansToDegrees, Positions } from "./utils";
import createBullet from "./bullet";
import { Vector } from "./vector";
import { Scene } from "./scenes/scene";

export enum BehaviorType {
  FollowSteady = "FollowSteady",
  Shoot = "Shoot",
  PatrolAroundTarget = "PatrolAroundTarget"
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

export function composeBehavior(sprite: Sprite, behavior: Behavior) {
  // only add properties if they're not already there
  Object.keys(behavior.properties).forEach(k => {
    if (sprite[k] === undefined) {
      sprite[k] = behavior.properties[k];
    }
  });
  // Object.assign(sprite, behavior.properties);
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
        this.activeBehavior = BehaviorType.FollowSteady;
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
        this.activeBehavior = undefined;
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
        const bullet = createBullet(
          this,
          this,
          angle,
          target,
          scene,
          /*owner*/ this
        );
        scene.addSprite(bullet);
      }
    }
  };
}

export function PatrolAroundTarget(
  patrolOrbit = 150,
  target: Sprite = undefined
): Behavior {
  return {
    type: BehaviorType.PatrolAroundTarget,
    properties: {
      patrolOrbit,
      angle: 0,
      dpta: 1,
      patrolTarget: target
    },
    // describe
    update(dt?: number) {
      // only patrol if there's no other active behavior
      // this behaves like a default behavior
      if (
        this.activeBehavior &&
        this.activeBehavior !== BehaviorType.PatrolAroundTarget
      ) {
        return;
      }
      if (!this.patrolTarget) return;

      this.activeBehavior = BehaviorType.PatrolAroundTarget;
      // if we are in the object's orbit then just traverse orbit
      // otherwise go towards the object
      let distanceToTarget = Vector.getDistanceMagnitude(
        this,
        this.patrolTarget
      );
      if (distanceToTarget > this.patrolOrbit) {
        let speed = 2;
        let distance = Vector.getDistance(this.patrolTarget, this);
        this.dx = (speed * distance.x) / distanceToTarget;
        this.dy = (speed * distance.y) / distanceToTarget;
      } else {
        // we're in orbit
        // does the angle correspond to our current position?
        // if it doesn't set the proper angle
        // HERE!!!

        // if it does just start orbiting
        this.dx = 0;
        this.dy = 0;
        this.angle += this.dpta;

        let newPosition = Positions.inCircleGivenAngle(
          this.patrolTarget,
          this.patrolOrbit,
          this.angle
        );
        this.x = newPosition.x;
        this.y = newPosition.y;
      }
    }
  };
}
