import Config from "../config";
import { createGameStatusText } from "../text";
import { Scene } from "../scenes/scene";

export interface ShipSystem {
  isEnabled: boolean;
  disable(): void;
  onEnergyIncreased?(energy: number): void;
  checkEnergyLeftAndDisable?(energy: number): void;
}

export function ShipSystemMixin(
  scene: Scene,
  name: string,
  energyThreshold: number
): ShipSystem {
  return {
    isEnabled: true,
    disable() {
      this.isEnabled = false;
      this.dt = 0;
    },
    checkEnergyLeftAndDisable(energy) {
      if (energy < energyThreshold && this.isEnabled) {
        this.disable();
        let textSprite = createGameStatusText(
          `- ${name.toUpperCase()} OFFLINE -`
        );
        scene.addSprite(textSprite);
      }
    },
    onEnergyIncreased(currentEnergy: number) {
      if (currentEnergy > energyThreshold && !this.isEnabled) {
        this.isEnabled = true;
        let textSprite = createGameStatusText(
          `- ${name.toUpperCase()} ONLINE -`
        );
        scene.addSprite(textSprite);
      }
    }
  } as ShipSystem;
}
