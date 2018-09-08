import { generateName } from "../names";
import { Faction } from "../factions";

/*
    WIP to use pools for planetary sector data such as:
    - sectors
    - suns
    - planets
    - static asteroids
    this is a perfect candidate for pools because planets, etc
    don't need to be rendered updated unless they're in sight
    or nearing sight at which point we can hidrate them from the
    pool.
*/

export interface SectorData {
  sun: SunData;
  planets: PlanetData[];
  bodies: Sprite[];
}
export function SectorData(position: Position, name = generateName()) {
  let sun = SunData(position);
  return {
    sun,
    planets: PlanetsData(sun),
    get bodies() {
      return [this.sun, ...this.planets];
    }
  };
}

export interface SunData extends Position {
  radius: number;
  sunName: string;
}
export function SunData(
  position: Position,
  sunName: string = generateName()
): SunData {
  return { ...position, sunName, radius: 0 };
}

export interface PlanetData {
  radius: number;
  angle: number;
  orbit: number;
  claimedBy: Faction;
}
export function PlanetsData(origin: Position): PlanetData[] {
  // generate planets
  return [];
}
