import { Position, getValueInRange } from "../utils";
import Config from "../config";
import { createGameStatusText } from "../text";
import { Scene } from "../scenes/scene";
import { ShipEnergy } from "./shipEnergy";
import { ShipSystem, ShipSystemMixin } from "./shipSystems";

export interface ShipShield extends Sprite, ShipSystem {
  isEnabled: boolean;
  damage(damage: number): void;
  disable(): void;
}

export function ShipShield(
  shield: number,
  energy: ShipEnergy,
  shieldPosition: Position,
  radius: number,
  scene: Scene
) {
  let shipShield = kontra.sprite({
    ...ShipSystemMixin(scene, "SHIELD", (energy.maxEnergy * 3) / 5),

    maxShield: shield,
    shield,

    // shield bar position
    x: 5,
    y: 25,
    // shield position
    shieldPosition,
    radius,

    dt: 0,
    dtr: 0,

    update(this: ShipShield) {
      this.dt += 1 / 60;
      if (this.dt > 0.25) {
        if (this.isEnabled) {
          // baseline for recharging energy
          if (this.shield < this.maxShield) this.shield++;
          this.checkEnergyLeftAndDisable(energy.energy);
        } else {
          // discharge shield
          this.damage(3);
        }
        this.dt = 0;
      }
    },

    render() {
      // render bar
      let shieldWidth = Math.ceil(
        (this.shield * Config.UI.Bar.Width) / this.maxShield
      );

      this.context.fillStyle = "#00edff";
      this.context.fillRect(this.x, this.y, shieldWidth, Config.UI.Bar.Height);
      // bar container
      this.context.strokeStyle = "white";
      this.context.strokeRect(
        this.x,
        this.y,
        Config.UI.Bar.Width,
        Config.UI.Bar.Height
      );

      // actual shield
      if (this.shield === 0) return;

      // Flickering behavior when shield is disabled
      // and is losing power
      this.dtr += 1 / 60;
      if (!this.isEnabled && this.dtr > 0.5 && this.dtr < 0.75) {
        return;
      } else if (!this.isEnabled && this.dtr > 0.75) {
        this.dtr = 0;
        return;
      }
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
        this.radius * 1.1,
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
        if (this.isEnabled)
          console.log(
            `Ship took shield damage ${damage}. Remaining shield is ${
              this.shield
            }`
          );
        else
          console.log(
            `Ship shield losing power ${damage}. Remaining shield is ${
              this.shield
            }`
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

  energy.subscribe(shipShield);

  return shipShield;
}
