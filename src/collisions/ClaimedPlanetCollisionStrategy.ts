import { BaseCollisionStrategy } from "./CollisionStrategy";
import { Planet } from "../planet";
import { Ship } from "../ship/ship";
import Config from "../config";
import { CollisionMethods } from "./CollisionMethods";
import { getRandomCellType, CellType } from "../cell";
import { getValueInRange, RGB } from "../utils";
import { createText } from "../text";
import { Scene } from "../scenes/scene";

export class ClaimedPlanetCollisionStrategy extends BaseCollisionStrategy {
  private haveCollided = CollisionMethods.ObjectWithinRadius.haveCollided;
  period = 0.4;

  constructor(private scene: Scene) {
    super(/* period */ 0.4);
  }

  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return (
      this.withinPeriod() &&
      ((isPlanetAndShip(s1, s2) && planetIsClaimed(s1 as Planet, s2 as Ship)) ||
        (isPlanetAndShip(s2, s1) && planetIsClaimed(s2 as Planet, s1 as Ship)))
    );
  }

  handleCollision(s1: Sprite, s2: Sprite): boolean {
    this.resetTicker();
    if (s1.type === SpriteType.Planet)
      return this.handleCollisionBetweenPlanetAndShip(s1 as Planet, s2 as Ship);
    else
      return this.handleCollisionBetweenPlanetAndShip(s2 as Planet, s1 as Ship);
  }

  handleCollisionBetweenPlanetAndShip(planet: Planet, ship: Ship): boolean {
    if (this.haveCollided(planet, ship, planet.outerRadius)) {
      // if it is a faction planet
      // then you get double the amount of energy/life
      let modifier =
        planet.planetType === Config.Factions[ship.faction].Planet ? 2 : 1;
      this.provideBoosts(ship, modifier);
      return true;
    }
    return false;
  }

  provideBoosts(ship: Ship, modifier = 1) {
    let cellType = getRandomCellType();
    // add energy or life to the ship
    if (cellType === CellType.Energy) {
      this.provideEnergyBoost(ship, modifier);
    } else if (cellType === CellType.Life) {
      this.provideLifeBoost(ship, modifier);
    }
  }
  provideEnergyBoost(ship: Ship, modifier = 1) {
    let energyBoost = Math.ceil(
      getValueInRange(0, Config.Cell.EnergyBoost * modifier)
    );
    ship.energy.recharge(energyBoost);
    this.addBoostText(energyBoost, ship, ship, { r: 0, g: 255, b: 0 });
  }
  provideLifeBoost(ship: Ship, modifier = 1) {
    let lifeBoost = Math.ceil(
      getValueInRange(0, Config.Cell.LifeBoost * modifier)
    );
    ship.life.repair(lifeBoost);
    this.addBoostText(lifeBoost, ship, ship, { r: 255, g: 0, b: 0 });
  }

  addBoostText(
    boost: number,
    position: Position,
    cameraPosition: Position,
    color: RGB
  ) {
    let cellText = createText(
      `+${boost}`,
      position,
      {
        velocity: { dx: 0, dy: -1 },
        ttl: 120,
        color,
        cameraPosition
      },
      { size: 12, family: "monospace" }
    );
    this.scene.addSprite(cellText);
  }
}

function isPlanetAndShip(s1: Sprite, s2: Sprite) {
  return s1.type === SpriteType.Planet && s2.type === SpriteType.Ship;
}

function planetIsClaimed(planet: Planet, ship: Ship) {
  return planet.claimedBy === ship.faction;
}
