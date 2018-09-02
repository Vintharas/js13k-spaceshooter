import { PlanetType } from "./planet";

export enum Faction {
  Red = "Red",
  Blue = "Blue",
  Green = "Green"
}

export interface FactionConfig {
  Name: string;
  Planet: PlanetType;
  PlanetName: string;
  Description: string;
}

export interface FactionShipModifiers {
  Life: number;
  Energy: number;
  Rotation: number;
  Shield: number;
  Speed: number;

  // TODO: these aren't used yet
  // I'll use them when attacking planets/ships/base stations
  Damage: number;
  Protection: number;
}
