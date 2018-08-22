import {
  degreesToRadians,
  Velocity,
  Position,
  getValueInRange,
  Sprite
} from "./utils";
import Scene from "./scene";
import createBullet from "./bullet";
import { createParticle, createStaticParticle } from "./particles";
import Config from "./config";
import createText from "./text";

export interface Ship extends Sprite {
  width: number;
  energy: ShipEnergy;
  life: ShipLife;
}
export interface ShipEnergy extends Sprite {
  recharge(value: number): void;
}
export interface ShipLife extends Sprite {
  repair(value: number): void;
}

export default function createShip(scene: Scene) {
  const width = 6;
  const x = 300;
  const y = 300;
  const energy = ShipEnergy(200, scene);
  const life = ShipLife(100);
  const shield = ShipShield(100, energy, { x, y }, width);

  const ship = kontra.sprite({
    type: "ship",

    // position
    // this is actually the position of the camera
    // of the game
    x,
    y,

    rotation: 0,

    // collisions
    width,

    // energy
    energy,
    life,
    shield,

    dt: 0, // track how much time has passed
    ttl: Infinity,

    render() {
      this.context.save();
      // transform the origin, and rotate around the origin
      // using the ships rotation

      // the ship is always in the middle of the canvas
      // we move the camera instead, which affects all other objects
      this.context.translate(300, 300);
      this.context.rotate(degreesToRadians(this.rotation));
      // draw a right facing triangle
      this.context.beginPath();
      this.context.moveTo(-3, -5);
      this.context.lineTo(12, 0);
      this.context.lineTo(-3, 5);
      this.context.closePath();
      this.context.stroke();
      this.context.restore();

      // draw ship energy and life bars
      this.energy.render();
      this.life.render();
      this.shield.render();
    },
    update() {
      // update ship energy
      this.energy.update();
      // slowly recover life
      this.life.update();
      // recharge shield
      this.shield.update();

      // rotate the ship left or right
      if (kontra.keys.pressed("left")) {
        this.rotation += -4;
      } else if (kontra.keys.pressed("right")) {
        this.rotation += 4;
      }
      // move the ship forward in the direction it's facing
      const cos = Math.cos(degreesToRadians(this.rotation));
      const sin = Math.sin(degreesToRadians(this.rotation));

      if (
        kontra.keys.pressed("up") &&
        this.energy.hasEnoughEnergy(EnergyCost.ThrustCost)
      ) {
        this.ddx = cos * 0.1;
        this.ddy = sin * 0.1;
        // reduce energy
        this.energy.consume(EnergyCost.ThrustCost);
        // create particles from this position
        let position: Position = ship;
        let velocity: Velocity = ship;
        for (let i = 0; i < 2; i++) {
          let particle = createStaticParticle(
            { x: 300, y: 300 }, // ship position remains static in the canvas
            { dx: 1, dy: 1 }, // base speed for particles
            // the particle axis is opposite to the rotation
            // of the ship (in the back)
            ship.rotation + 180
          );
          scene.sprites.push(particle);
        }
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

      // allow the player to fire no more than 1 bullet every 1/4 second
      this.dt += 1 / 60;
      if (
        kontra.keys.pressed("space") &&
        this.dt > 0.25 &&
        this.energy.hasEnoughEnergy(EnergyCost.ShootCost)
      ) {
        this.dt = 0;
        // reduce energy
        this.energy.consume(EnergyCost.ShootCost);

        let position: Position = this;
        let velocity: Velocity = this;
        let cameraPosition: Position = this;

        const bullet = createBullet(
          position,
          velocity,
          cos,
          sin,
          cameraPosition
        );
        scene.addSprite(bullet);
      }
    }
  });

  // TODO: clean this up, there's a little bit
  // of circular dependencies issue here
  // scene needs to know the camera position (the ship)
  // while the ship needs the scene to push new sprites into the scene
  // (problem caused by the entaglement of camera and ship)
  scene.cameraPosition = ship;

  return ship;
}

// TODO: extract to config
const barWidth = 100;
const barHeight = 5;
const EnergyCost = {
  ThrustCost: 1,
  ShootCost: 10,
  ShieldRechargeCost: 1
};

// TODO: shipEnergy and shipLife
// extract visual representation from behavior
// Both are similarly rendered but may offer different behaviors
// (the difference in behaviors depends on where I decide to put more collision and damaging logic)
function ShipEnergy(energy: number, scene: Scene) {
  return kontra.sprite({
    maxEnergy: energy,
    energy,

    x: 5,
    y: 5,

    dt: 0,

    update() {
      this.dt += 1 / 60;
      if (this.dt > 0.25) {
        // baseline for recharging energy
        this.recharge(1);
        this.dt = 0;
      }
    },
    render() {
      // energy bar
      let energyWidth = Math.ceil((this.energy * barWidth) / this.maxEnergy);

      this.context.fillStyle = "green";
      this.context.fillRect(this.x, this.y, energyWidth, barHeight);
      // energy bar container
      this.context.strokeStyle = "white";
      this.context.strokeRect(this.x, this.y, barWidth, barHeight);
    },

    consume(energyCost: number) {
      if (this.energy > 0) this.energy -= energyCost;

      // review systems that need to be disabled
      // when energy increases
      if (this.energy < (this.maxEnergy * 4) / 5 && this.shield.isEnabled) {
        if (Config.debug) console.log("Low on energy. Disabling shield");
        this.shield.disable();
        this.addOfflineText("- SHIELD OFFLINE -");
      }
    },

    recharge(energyBoost: number) {
      // TODO: Extra this increase-value-but-not-past-this-value in a function
      if (this.energy < this.maxEnergy) this.energy += energyBoost;
      if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
      // review systems that need to be enabled
      // when energy increases
      if (this.energy > (this.maxEnergy * 4) / 5 && !this.shield.isEnabled) {
        this.addOfflineText("- SHIELD ONLINE -");
      }
    },

    hasEnoughEnergy(energyCost: number) {
      return this.energy >= energyCost;
    },

    addOfflineText(text: string) {
      let textSprite = createText(
        text,
        { x: 200, y: 400 },
        { ttl: 120 },
        { size: 18, family: "monospace" }
      );
      scene.sprites.push(textSprite);
    }
  });
}

function ShipLife(life: number) {
  return kontra.sprite({
    maxLife: life,
    life,

    x: 5,
    y: 15,

    dt: 0,

    update() {
      this.dt += 1 / 60;
      if (this.dt > 1) {
        // baseline for recharging energy
        this.dt = 0;
        this.repair(1);
      }
    },
    repair(lifeBoost: number): void {
      if (this.life < this.maxLife) this.life += lifeBoost;
      if (this.life > this.maxLife) this.life = this.maxLife;
    },
    render() {
      // energy bar
      let lifeWidth = Math.ceil((this.life * barWidth) / this.maxLife);

      this.context.fillStyle = "red";
      this.context.fillRect(this.x, this.y, lifeWidth, barHeight);
      // energy bar container
      this.context.strokeStyle = "white";
      this.context.strokeRect(this.x, this.y, barWidth, barHeight);
    },

    damage(damage: number) {
      if (this.life > 0) this.life -= damage;
      if (this.life < 0) this.life = 0;
      if (Config.debug) {
        console.log(
          `Ship took damage ${damage}. Remaining life is ${this.life}`
        );
      }
    },

    get(): number {
      return this.life;
    }
  });
}

function ShipShield(
  shield: number,
  energy: any,
  shieldPosition: Position,
  radius: number
) {
  let shipShield = kontra.sprite({
    maxShield: shield,
    shield,
    isEnabled: true,

    // shield bar position
    x: 5,
    y: 25,
    // shield position
    shieldPosition,
    radius,

    dt: 0,

    update() {
      this.dt += 1 / 60;
      if (this.dt > 0.25) {
        if (this.isEnabled) {
          // baseline for recharging energy
          if (this.shield < this.maxShield) this.shield++;
          energy.consume(EnergyCost.ShieldRechargeCost);
        } else {
          // discharge shield
          this.damage(3);
        }
        this.dt = 0;
      }
    },

    render() {
      // render bar
      let shieldWidth = Math.ceil((this.shield * barWidth) / this.maxShield);

      this.context.fillStyle = "#00edff";
      this.context.fillRect(this.x, this.y, shieldWidth, barHeight);
      // bar container
      this.context.strokeStyle = "white";
      this.context.strokeRect(this.x, this.y, barWidth, barHeight);

      // actual shield
      if (this.shield === 0) return;
      // TODO: would be interesting to do some flicker for some frames
      // when it gets disabled

      // TODO2: it would be cool if it did some warping as well
      // added some warping but it may be more smooth to change it
      // every longer period of time in a more smooth fashion
      this.context.save();
      this.context.strokeStyle = "#00edff";
      this.context.fillStyle = "rgba(0, 237, 255, 0.2)";
      this.context.beginPath(); // start drawing a shape
      this.context.arc(
        this.shieldPosition.x + getValueInRange(-0.5, 0.5),
        this.shieldPosition.y + getValueInRange(-0.5, 0.5),
        this.radius * 2.2,
        0,
        Math.PI * 2
      );
      this.context.stroke(); // outline the circle
      this.context.fill();
      this.context.restore();
    },

    damage(damage: number) {
      if (this.shield > 0) this.shield -= damage;
      if (this.shield < 0) this.shield = 0;
      if (Config.debug) {
        console.log(
          `Ship took damage ${damage}. Remaining life is ${this.life}`
        );
      }
    },

    get(): number {
      return this.shield;
    },

    disable() {
      if (Config.debug) console.log("shield offline!!");
      this.isEnabled = false;
    }
  });

  // TODO: fix this circular dependency mehhh
  energy.shield = shipShield;

  return shipShield;
}
