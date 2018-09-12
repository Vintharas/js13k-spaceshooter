import { Faction } from "../factions";
import { Planet } from "../planet";

export interface GameData {
  faction: Faction;
  earth: Planet;
}

export function GameData(faction: Faction): GameData {
  return {
    faction,
    earth: undefined
  };
}
