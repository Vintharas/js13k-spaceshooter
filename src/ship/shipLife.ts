import { after, noop } from "../fp";
import { doThisEvery } from "../Time";
import { Draw } from "../draw";

export interface ShipLife extends Sprite {
  repair(value: number): void;
}

export function ShipLife(life: number, modifier = 0) {
  return kontra.sprite({
    maxLife: life,
    life,

    x: 5,
    y: 15,

    update: after(
      noop,
      doThisEvery({
        action() {
          this.repair(1 + modifier);
        },
        t: 1
      })
    ),
    repair(lifeBoost: number): void {
      if (this.life < this.maxLife) this.life += lifeBoost;
      if (this.life > this.maxLife) this.life = this.maxLife;
    },
    render() {
      // energy bar
      let lifeWidth = Math.ceil((this.life * barWidth) / this.maxLife);

      Draw.fillRect(this.context, this.x, this.y, lifeWidth, barHeight, "red");
      // energy bar container
      Draw.strokeRect(
        this.context,
        this.x,
        this.y,
        barWidth,
        barHeight,
        "white"
      );
    },

    damage(damage: number) {
      if (this.life > 0) this.life -= damage;
      if (this.life < 0) this.life = 0;
      /*
      if (Config.debug) {
        console.log(
          `Ship took damage ${damage}. Remaining life is ${this.life}`
        );
      }
      */
    },

    get(): number {
      return this.life;
    }
  });
}

// TODO: extract to config
let barWidth = 100;
let barHeight = 5;
