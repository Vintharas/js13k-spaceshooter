import { Faction } from "../factions";

export interface GameData {
  faction: Faction;
}

export function GameData(faction: Faction) {
  return {
    faction
  };
}
