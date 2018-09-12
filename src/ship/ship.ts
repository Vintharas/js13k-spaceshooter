import { degreesToRadians, Position } from "../utils";
import { Scene } from "../scenes/scene";
import { createStaticParticle, Particle } from "../particles";
import Config from "../config";
import { Faction } from "../factions";
import { ShipRadar } from "./shipRadar";
import { ShipSpeedAndLocation } from "./shipSpeed";
import { ShipShield } from "./shipShield";
import { ShipEnergy } from "./shipEnergy";
import { ShipLife } from "./shipLife";
import { ShipWeapons } from "./shipWeapons";
import { ShipVision } from "./shipVision";
import { updateWasDamageStatus } from "../behavior";
import { after } from "../fp";

export interface Ship extends Sprite {
  width: number;
  collisionWidth: number;
  energy: ShipEnergy;
  life: ShipLife;
  speed: ShipSpeedAndLocation;
  faction: Faction;
  radar: ShipRadar;
  weapons: ShipWeapons;

  takeDamage(damage: number): void;
}

export default function createShip(scene: Scene, faction: Faction) {
  let factionConfig = Config.Factions[faction];
  //let modifiers = factionConfig.Modifiers;
  //let x = Config.canvasWidth / 2;
  //let y = Config.canvasHeight / 2;
  let x = 5500;
  let y = 5500;
  let collisionWidth = 20;
  let energy = ShipEnergy(
    700, // + modifiers.Energy,
    scene
    //modifiers.EnergyRechargeRate
  );
  let life = ShipLife(300); //+ modifiers.Life, modifiers.LifeRepairRate);
  let shield = ShipShield(
    400, // + modifiers.Shield,
    energy,
    { x: Config.canvasWidth / 2, y: Config.canvasHeight / 2 },
    collisionWidth,
    scene
    //modifiers.ShieldRechargeRate
  );
  let speed = ShipSpeedAndLocation();
  let radar = ShipRadar(scene, energy);
  let weapons = ShipWeapons(
    scene,
    energy,
    0, //modifiers.FireRate,
    factionConfig.Color
  );
  let vision = ShipVision(scene, energy);

  let ship = kontra.sprite({
    type: SpriteType.Ship,
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

    // damage animation
    wasDamaged: false,

    takeDamage(this: Ship, damage: number) {
      if (this.shield.get() > 0) {
        this.shield.damage(damage);
        if (this.shield.get() <= 0) {
          // do some remaining damage to ship but less
          this.life.damage(damage / 4);
          this.wasDamaged = true;
        }
      } else {
        this.life.damage(damage);
        this.wasDamaged = true;
      }
      if (this.life.get() <= 0) {
        // if (Config.debug) console.log("SHIP DIED");
        this.ttl = 0; // game over mothafucka!
      }
    },

    render() {
      this.context.save();
      // transform the origin, and rotate around the origin
      // using the ships rotation

      // the ship is always in the middle of the canvas
      // we move the camera instead, which affects all other objects
      this.context.translate(Config.canvasWidth / 2, Config.canvasHeight / 2);
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

      if (this.wasDamaged) {
        this.context.globalCompositeOperation = "source-atop";
        this.context.fillStyle = "rgba(255,0,0,0.5)";
        this.context.fillRect(-16, -16, 32, 32);
      }

      /*
      // Drawing asteroids as a circle
      // this is what we use for collision
      // useful for debugging
      if (Config.debug && Config.renderCollisionArea) {
        this.context.strokeStyle = "red";
        this.context.beginPath(); // start drawing a shape
        this.context.arc(0, 0, this.collisionWidth, 0, Math.PI * 2);
        this.context.stroke(); // outline the circle
      }
      */
      this.context.restore();

      this.parts.forEach((s: Sprite) => s.render());
    },
    update: after(function update(this: Ship) {
      this.weapons.updateShipInformation(this, this, this.rotation);
      this.speed.updateShipInformation(this);
      this.parts.forEach((s: Sprite) => s.update());

      // rotate the ship left or right
      if (kontra.keys.pressed("left")) {
        this.rotation -= 3; // + modifiers.Rotation;
        let particle = this.createShipParticle(ship.rotation + 75, {
          x: 5,
          y: -10
        });
        scene.addSprite(particle);
      } else if (kontra.keys.pressed("right")) {
        this.rotation += 3; // + modifiers.Rotation;
        let particle = this.createShipParticle(ship.rotation - 75, {
          x: 5,
          y: 10
        });
        scene.addSprite(particle);
      }
      // move the ship forward in the direction it's facing
      const cos = Math.cos(degreesToRadians(this.rotation));
      const sin = Math.sin(degreesToRadians(this.rotation));
      const acceleration = 0.1; // + modifiers.Speed;

      const thrustCost = 1;
      const brakeCost = 1;
      if (
        kontra.keys.pressed("up") &&
        this.energy.hasEnoughEnergy(thrustCost)
      ) {
        this.ddx = cos * acceleration;
        this.ddy = sin * acceleration;
        // reduce energy
        this.energy.consume(thrustCost);
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
        this.energy.hasEnoughEnergy(brakeCost)
      ) {
        this.ddx = (cos * -acceleration) / 2;
        this.ddy = (sin * -acceleration) / 2;
        // reduce energy
        this.energy.consume(brakeCost);
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
    }, updateWasDamageStatus()),
    createShipParticle(
      particleAxis: number,
      offset: Position = { x: 0, y: 0 }
    ): Particle {
      return createStaticParticle(
        { x: Config.canvasWidth / 2, y: Config.canvasHeight / 2 }, // ship position remains static in the canvas
        { dx: 1, dy: 1 }, // base speed for particles
        // the particle axis is opposite to the rotation
        // of the ship (in the back)
        particleAxis,
        offset
      );
    }
  });

  // circular dependency necessary for
  // ship weapons not to collide with the ship
  // itself. TODO: solve this in a better way
  weapons.ship = ship;

  return ship;
}
