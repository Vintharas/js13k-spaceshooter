import { Scene } from "../scenes/scene";

import Config from "../config";

import { createGameStatusText } from "../text";

export interface ShipEnergy extends Sprite {
  recharge(value: number): void;
}

// TODO: shipEnergy and shipLife
// extract visual representation from behavior
// Both are similarly rendered but may offer different behaviors
// (the difference in behaviors depends on where I decide to put more collision and damaging logic)
export function ShipEnergy(energy: number, scene: Scene) {
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
        this.shield.isEnabled = true;
        this.addOfflineText("- SHIELD ONLINE -");
      }
    },

    hasEnoughEnergy(energyCost: number) {
      return this.energy >= energyCost;
    },

    addOfflineText(text: string) {
      let textSprite = createGameStatusText(text);
      scene.addSprite(textSprite);
    }
  });
}

// TODO: extract to config
const barWidth = 100;
const barHeight = 5;
export const EnergyCost = {
  ThrustCost: 1,
  BrakeCost: 1,
  ShootCost: 10,
  ShieldRechargeCost: 1
};
