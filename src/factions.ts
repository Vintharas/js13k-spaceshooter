import { PlanetType } from "./planet";

export const enum Faction {
  Red,
  Blue,
  Green
}

export interface FactionConfig {
  Name: string;
  Planet: PlanetType;
  PlanetName: string;
  Description: string;
}

export interface FactionShipModifiers {
  Life: number;
  LifeRepairRate: number;
  Energy: number;
  EnergyRechargeRate: number;
  Rotation: number;
  Shield: number;
  ShieldRechargeRate: number;
  Speed: number;

  // TODO: these aren't used yet
  // I'll use them when attacking planets/ships/base stations
  FireRate: number;
  Damage: number;
  Protection: number;
}
