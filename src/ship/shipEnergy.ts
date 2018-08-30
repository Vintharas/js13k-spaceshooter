import { Scene } from "../scenes/scene";
import Config from "../config";
import { createGameStatusText } from "../text";
import { ShipWeapons } from "./shipWeapons";
import { ShipRadar } from "./shipradar";
import { ShipShield } from "./shipShield";
import { ShipVision } from "./ShipVision";
import { ShipSystem } from "./shipSystems";

export interface ShipEnergy extends Sprite {
  consume(energy: number): void;
  recharge(value: number): void;
  hasEnoughEnergy(energy: number): boolean;

  subscribe(system: ShipSystem): void;
  systems: ShipSystem[];

  radar: ShipRadar;
  weapons: ShipWeapons;
  vision: ShipVision;
}

// TODO: shipEnergy and shipLife
// extract visual representation from behavior
// Both are similarly rendered but may offer different behaviors
// (the difference in behaviors depends on where I decide to put more collision and damaging logic)
export function ShipEnergy(energy: number, scene: Scene) {
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
        // baseline for recharging energy
        // TODO: change baseline based on systems that are enabled!
        // when less systems are enabled recharge faster (probably more playable)
        let energyToRecharge = 1;
        if (this.energy < (this.maxEnergy * 2) / 5) energyToRecharge = 4;
        else if (this.energy < (this.maxEnergy * 3) / 5) energyToRecharge = 3;
        else if (this.energy < (this.maxEnergy * 4) / 5) energyToRecharge = 2;
        this.recharge(energyToRecharge);
        this.dt = 0;
      }
    },
    render() {
      // energy bar
      let energyWidth = Math.ceil(
        (this.energy * Config.UI.Bar.Width) / this.maxEnergy
      );

      this.context.fillStyle = "green";
      this.context.fillRect(this.x, this.y, energyWidth, Config.UI.Bar.Height);
      // energy bar container
      this.context.strokeStyle = "white";
      this.context.strokeRect(
        this.x,
        this.y,
        Config.UI.Bar.Width,
        Config.UI.Bar.Height
      );
    },

    consume(energyCost: number) {
      if (this.energy > 0) this.energy -= energyCost;

      // review systems that need to be disabled
      // when energy increases
      if (this.energy < (this.maxEnergy * 4) / 5 && this.radar.isEnabled) {
        if (Config.debug) console.log("Low on energy. Disabling radar");
        this.radar.disable();
        this.addOfflineText("- RADAR OFFLINE -");
      }
      if (this.energy < (this.maxEnergy * 2) / 5 && this.weapons.isEnabled) {
        if (Config.debug) console.log("Low on energy. Disabling weapons");
        this.weapons.disable();
        this.addOfflineText("- WEAPONS OFFLINE -");
      }
      if (this.energy < (this.maxEnergy * 1) / 5 && this.vision.isEnabled) {
        if (Config.debug) console.log("Low on energy. Disabling vision");
        this.vision.disable();
        this.addOfflineText("- NEAR SPACE RADAR OFFLINE -");
      }
    },

    recharge(this: ShipEnergy, energyBoost: number) {
      // TODO: Extra this increase-value-but-not-past-this-value in a function
      if (this.energy < this.maxEnergy) this.energy += energyBoost;
      if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
      // review systems that need to be enabled
      // when energy increases

      if (this.energy > (this.maxEnergy * 4) / 5 && !this.radar.isEnabled) {
        this.radar.isEnabled = true;
        this.addOfflineText("- RADAR ONLINE -");
      }
      if (this.energy > (this.maxEnergy * 2) / 5 && !this.weapons.isEnabled) {
        this.weapons.isEnabled = true;
        this.addOfflineText("- WEAPONS ONLINE -");
      }
      if (this.energy > (this.maxEnergy * 1) / 5 && !this.vision.isEnabled) {
        this.vision.isEnabled = true;
        this.addOfflineText("- NEAR SPACE RADAR ONLINE -");
      }

      this.systems.forEach(s => s.onEnergyIncreased(this.energy));
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
