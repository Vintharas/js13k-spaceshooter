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
