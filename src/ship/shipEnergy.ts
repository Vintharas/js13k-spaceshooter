import { Scene } from "../scenes/scene";
import Config from "../config";
import { ShipSystem } from "./shipSystems";

export interface ShipEnergy extends Sprite {
  consume(energy: number): void;
  recharge(value: number): void;
  hasEnoughEnergy(energy: number): boolean;

  subscribe(system: ShipSystem): void;
  systems: ShipSystem[];
}

// TODO: shipEnergy and shipLife
// extract visual representation from behavior
// Both are similarly rendered but may offer different behaviors
// (the difference in behaviors depends on where I decide to put more collision and damaging logic)
export function ShipEnergy(
  energy: number,
  scene: Scene,
  modifier = 0
): ShipEnergy {
  return kontra.sprite({
    maxEnergy: energy,
    energy,
    systems: [],
    subscribe(shipSystem: ShipSystem) {
      this.systems.push(shipSystem);
    },

    x: 5,
    y: 5,

    dt: 0,

    update(this: ShipEnergy) {
      this.dt += 1 / 60;
      if (this.dt > 0.25) {
        // TODO: can be affected by proximity to sun
        let maxEnergyRecharge = 5;
        let activeSystems = this.systems.filter(s => s.isEnabled).length;
        let energyToRecharge = maxEnergyRecharge - activeSystems;
        this.recharge(energyToRecharge + modifier);
        this.dt = 0;
      }
    },
    render() {
      // energy bar
      let barWidth = 100;
      let barHeight = 5;
      let energyWidth = Math.ceil((this.energy * barWidth) / this.maxEnergy);

      this.context.fillStyle = "green";
      this.context.fillRect(this.x, this.y, energyWidth, barHeight);
      // energy bar container
      this.context.strokeStyle = "white";
      this.context.strokeRect(this.x, this.y, barWidth, barHeight);
    },

    consume(this: ShipEnergy, energyCost: number) {
      if (this.energy > 0) this.energy -= energyCost;
      this.systems.forEach(s => s.onEnergyChanged(this.energy));
    },

    recharge(this: ShipEnergy, energyBoost: number) {
      // TODO: Extra this increase-value-but-not-past-this-value in a function
      if (this.energy < this.maxEnergy) this.energy += energyBoost;
      if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
      this.systems.forEach(s => s.onEnergyChanged(this.energy));
    },

    hasEnoughEnergy(energyCost: number) {
      return this.energy >= energyCost;
    },

    addOfflineText(text: string) {
      scene.showMessage(text);
    }
  });
}
