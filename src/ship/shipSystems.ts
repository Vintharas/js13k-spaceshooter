export interface ShipSystem {
  isEnabled: boolean;
  onEnergyIncreased(energy: number): void;
}
