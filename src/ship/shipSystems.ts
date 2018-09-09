import { Scene } from "../scenes/scene";

export interface ShipSystem {
  isEnabled: boolean;
  disable(): void;
  onEnergyChanged(energy: number): void;
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
    onEnergyChanged(currentEnergy: number) {
      if (currentEnergy > energyThreshold && !this.isEnabled) {
        this.isEnabled = true;
        scene.showMessage(`- ${name.toUpperCase()} ONLINE -`);
      } else if (currentEnergy < energyThreshold && this.isEnabled) {
        this.disable();
        scene.showMessage(`- ${name.toUpperCase()} OFFLINE -`);
      }
    }
  } as ShipSystem;
}
