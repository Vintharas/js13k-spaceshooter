import Config from "../config";
import { ShipSystem } from "./shipSystems";

export interface ShipLife extends Sprite {
  repair(value: number): void;
}

export function ShipLife(life: number) {
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

// TODO: extract to config
const barWidth = 100;
const barHeight = 5;
