import { degreesToRadians, Velocity, Position } from "./utils";
import Scene from "./scene";
import createBullet from "./bullet";

export default function createShip(scene: Scene) {
  const ship = kontra.sprite({
    type: "ship",

    // position
    // this is actually the position of the camera
    // of the game
    x: 300,
    y: 300,

    rotation: 0,

    // collisions
    width: 6,

    // energy
    energy: ShipEnergy(200),

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

      // draw ship energy
      this.energy.render();
    },
    update() {
      // update ship energy
      this.energy.update();

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
      if (kontra.keys.pressed("space") && this.dt > 0.25) {
        this.dt = 0;
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

  return ship;
}

const barWidth = 100;
const barHeight = 10;
const EnergyCost = {
  ThrustCost: 1
};

function ShipEnergy(energy: number) {
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
        if (this.energy < this.maxEnergy) this.energy++;
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
    },

    hasEnoughEnergy(energyCost: number) {
      return this.energy >= energyCost;
    }
  });
}
