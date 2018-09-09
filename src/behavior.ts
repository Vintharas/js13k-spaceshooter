import { radiansToDegrees, Positions, getValueInRange } from "./utils";
import createBullet from "./bullet";
import { Vector } from "./vector";
import { Scene } from "./scenes/scene";
import { doThisEvery } from "./Time";
import { after, before } from "./fp";

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

export function FollowSteadyBehavior(
  target: Sprite,
  distanceToFollow: number = 500
): Behavior {
  return {
    type: BehaviorType.FollowSteady,
    properties: {
      dtfs: 0,
      speed: 2
    },
    update(dt?: number) {
      this.dtfs += 1 / 60;
      let distanceToShip = Vector.getDistanceMagnitude(this, target);
      if (distanceToShip < distanceToFollow && this.dtfs > 0.25) {
        this.activeBehavior = BehaviorType.FollowSteady;
        // follow target when it's close
        this.dtfs = 0;
        let distance = Vector.getDistance(target, this);
        this.dx = (this.maxSpeed * distance.x) / distanceToShip;
        this.dy = (this.maxSpeed * distance.y) / distanceToShip;
      } else if (
        this.dtfs > 1 &&
        this.activeBehavior === BehaviorType.FollowSteady
      ) {
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
      dts: 0,
      damage: 1,
      color: { r: 255, g: 255, b: 255 }
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
          /*owner*/ this,
          this.damage,
          this.color
        );
        scene.addSprite(bullet);
      }
    }
  };
}

export enum PatrolType {
  Orbit,
  Random
}

export function PatrolAroundTarget(
  patrolType: PatrolType = PatrolType.Orbit,
  patrolOrbit = 150,
  target: Sprite = undefined
): Behavior {
  return {
    type: BehaviorType.PatrolAroundTarget,
    properties: {
      patrolOrbit,
      angle: 0,
      dpta: 1, // da (angle) patrol around target
      dtpt: 0, // dt (time) patrol around target
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
      if (patrolType === PatrolType.Orbit) {
        performOrbitPatrol.call(this);
      } else {
        performRandomPatrol.call(this);
      }
    }
  };
}

function performOrbitPatrol() {
  // if we are in the object's orbit then just traverse orbit
  // otherwise go towards the object
  let distanceToTarget = Vector.getDistanceMagnitude(this, this.patrolTarget);
  if (distanceToTarget > this.patrolOrbit) {
    let distance = Vector.getDistance(this.patrolTarget, this);
    this.dx = (this.speed * distance.x) / distanceToTarget;
    this.dy = (this.speed * distance.y) / distanceToTarget;
  } else {
    // we're in orbit
    // does the angle correspond to our current position?
    // TODO: if it doesn't set the proper angle
    // right now it looks weird, it just jumps to the angle :D
    // teleport!!!

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

function performRandomPatrol() {
  // if we are in the object's orbit then just
  // more around randomly
  // otherwise go back to the orbit by moving directly
  // to the target
  let distanceToTarget = Vector.getDistanceMagnitude(this, this.patrolTarget);
  if (distanceToTarget > this.patrolOrbit) {
    // move toward target
    let distance = Vector.getDistance(this.patrolTarget, this);
    this.dx = (this.speed * distance.x) / distanceToTarget;
    this.dy = (this.speed * distance.y) / distanceToTarget;
    this.dtpt = 0;
  } else {
    this.dtpt += 1 / 60;
    if ((this.dx === 0 && this.dy === 0) || this.dtpt > 1) {
      this.dtpt = 0;
      // find new random direction every second
      let newDirection = getValueInRange(0, 2 * Math.PI);
      this.dx = this.speed * Math.cos(newDirection);
      this.dy = this.speed * Math.sin(newDirection);
    }
  }
}

// CANDIDATES for behaviors

// TODO: This could be wrapped into a behavior
// that could be composed with objects ad hoc
// it's slighltly more involved because it's compounded of
// 1. keeping state of wasDamaged and updating it
// 2. rendering coloring which will be slighlty different
// per object. At least right now
export function updateWasDamageStatus() {
  // returns a function that
  // updates was damage status every 0.25 seconds
  return doThisEvery({
    condition() {
      return this.wasDamaged;
    },
    action() {
      this.wasDamaged = false;
    },
    t: 0.25
  });
}
