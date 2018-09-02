import { degreesToRadians, Position } from "../utils";
import { Scene } from "../scenes/scene";
import { createStaticParticle, Particle } from "../particles";
import Config from "../config";
import { Faction } from "../factions";
import { ShipRadar } from "./shipRadar";
import { ShipSpeed } from "./shipSpeed";
import { ShipShield } from "./shipShield";
import { ShipEnergy } from "./shipEnergy";
import { ShipLife } from "./shipLife";
import { ShipWeapons } from "./shipWeapons";
import { ShipVision } from "./shipVision";

export interface Ship extends Sprite {
  width: number;
  collisionWidth: number;
  energy: ShipEnergy;
  life: ShipLife;
  speed: ShipSpeed;
  faction: Faction;
  radar: ShipRadar;
  weapons: ShipWeapons;

  takeDamage(damage: number): void;
}

export default function createShip(scene: Scene, faction: Faction) {
  const modifiers = Config.Factions[faction].Modifiers;
  const collisionWidth = 20;
  const x = Config.Ship.InitialPosition.x;
  const y = Config.Ship.InitialPosition.y;
  const energy = ShipEnergy(
    Config.Ship.Energy + modifiers.Energy,
    scene,
    modifiers.EnergyRechargeRate
  );
  const life = ShipLife(
    Config.Ship.Life + modifiers.Life,
    modifiers.LifeRepairRate
  );
  const shield = ShipShield(
    Config.Ship.Shield + modifiers.Shield,
    energy,
    { x, y },
    collisionWidth,
    scene,
    modifiers.ShieldRechargeRate
  );
  const speed = ShipSpeed();
  const radar = ShipRadar(scene, energy);
  const weapons = ShipWeapons(scene, energy, modifiers.FireRate);
  const vision = ShipVision(scene, energy);

  const ship = kontra.sprite({
    type: "ship",
    faction,
    parts: [energy, life, shield, speed, radar, weapons, vision],

    // TODO: factions will have different ships
    image: Config.Factions[faction].Ship,

    // position
    // this is actually the position of the camera
    // of the game
    x,
    y,

    rotation: 0,

    // collisions
    // INFO: the width is automatically setup by the image sprite
    // in image sprites. So it'll be 32 regardless what I set here
    // that's why I need to use a separate variable to store
    // the actual collision width I want to use
    //width,
    collisionWidth,

    // energy, life and ship systems
    energy,
    life,
    shield,
    speed,
    radar,
    weapons,
    vision,

    dt: 0, // track how much time has passed
    ttl: Infinity,

    takeDamage(this: Ship, damage: number) {
      if (this.shield.get() > 0) {
        this.shield.damage(damage);
        if (this.shield.get() <= 0) {
          // do some remaining damage to ship but less
          this.life.damage(damage / 4);
        }
      } else {
        this.life.damage(damage);
      }
      if (this.life.get() <= 0) {
        if (Config.debug) console.log("SHIP DIED");
        this.ttl = 0; // game over mothafucka!
      }
    },

    render() {
      this.context.save();
      // transform the origin, and rotate around the origin
      // using the ships rotation

      // the ship is always in the middle of the canvas
      // we move the camera instead, which affects all other objects
      this.context.translate(x, y);
      this.context.rotate(degreesToRadians(this.rotation));
      /*
      // draw ship as a triangle
      // draw a right facing triangle
      this.context.beginPath();
      this.context.strokeStyle = "red";
      this.context.fillStyle = "red";
      this.context.moveTo(-3, -5);
      this.context.lineTo(12, 0);
      this.context.lineTo(-3, 5);
      this.context.closePath();
      this.context.stroke();
      this.context.fill();
      */
      // tell kontra to draw the image sprite
      this.context.drawImage(this.image, -16, -16);

      // Drawing asteroids as a circle
      // this is what we use for collision
      // useful for debugging
      if (Config.debug && Config.renderCollisionArea) {
        this.context.strokeStyle = "red";
        this.context.beginPath(); // start drawing a shape
        this.context.arc(0, 0, this.collisionWidth, 0, Math.PI * 2);
        this.context.stroke(); // outline the circle
        console.log(this.width);
      }
      this.context.restore();

      this.parts.forEach((s: Sprite) => s.render());
    },
    update(this: Ship) {
      this.weapons.updateShipInformation(this, this, this.rotation);
      this.speed.updateSpeed(this.dx, this.dy);
      this.parts.forEach((s: Sprite) => s.update());

      // rotate the ship left or right
      if (kontra.keys.pressed("left")) {
        this.rotation -= 3 + modifiers.Rotation;
        let particle = this.createShipParticle(ship.rotation + 75, {
          x: 5,
          y: -10
        });
        scene.addSprite(particle);
      } else if (kontra.keys.pressed("right")) {
        this.rotation += 3 + modifiers.Rotation;
        let particle = this.createShipParticle(ship.rotation - 75, {
          x: 5,
          y: 10
        });
        scene.addSprite(particle);
      }
      // move the ship forward in the direction it's facing
      const cos = Math.cos(degreesToRadians(this.rotation));
      const sin = Math.sin(degreesToRadians(this.rotation));
      const acceleration = 0.1 + modifiers.Speed;

      if (
        kontra.keys.pressed("up") &&
        this.energy.hasEnoughEnergy(Config.Ship.EnergyCost.Thrust)
      ) {
        this.ddx = cos * acceleration;
        this.ddy = sin * acceleration;
        // reduce energy
        this.energy.consume(Config.Ship.EnergyCost.Thrust);
        // create particles from this position
        for (let i = 0; i < 2; i++) {
          let particle = this.createShipParticle(ship.rotation + 180, {
            x: 20,
            y: 0
          });
          scene.addSprite(particle);
        }
      } else if (
        kontra.keys.pressed("down") &&
        this.energy.hasEnoughEnergy(Config.Ship.EnergyCost.Brake)
      ) {
        this.ddx = (cos * -acceleration) / 2;
        this.ddy = (sin * -acceleration) / 2;
        // reduce energy
        this.energy.consume(Config.Ship.EnergyCost.Brake);
        // create particles from this position

        let particleLeft = this.createShipParticle(ship.rotation + 75, {
          x: 5,
          y: -10
        });
        let particleRight = this.createShipParticle(ship.rotation - 75, {
          x: 5,
          y: 10
        });
        scene.addSprite(particleLeft);
        scene.addSprite(particleRight);
      } else {
        this.ddx = this.ddy = 0;
      }

      this.advance();
      // set a max speed
      const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      if (magnitude > 10) {
        this.dx *= 0.95;
        this.dy *= 0.95;
      }
    },
    createShipParticle(
      particleAxis: number,
      offset: Position = { x: 0, y: 0 }
    ): Particle {
      return createStaticParticle(
        { x, y }, // ship position remains static in the canvas
        { dx: 1, dy: 1 }, // base speed for particles
        // the particle axis is opposite to the rotation
        // of the ship (in the back)
        particleAxis,
        offset
      );
    }
  });

  return ship;
}
