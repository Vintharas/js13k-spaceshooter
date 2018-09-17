import { CollisionStrategy } from "./CollisionStrategy";
import { Planet, PlanetType } from "../planet";
import { Ship } from "../ship/ship";
import Game from "../game";
import { Story } from "../story";
import { CollisionMethods } from "./CollisionMethods";
import { Scene } from "../scenes/scene";

export class UnclaimedPlanetCollisionStrategy implements CollisionStrategy {
  private haveCollided = CollisionMethods.ObjectWithinRadius.haveCollided;

  constructor(private scene: Scene) {}

  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return (
      (isPlanetAndShip(s1, s2) && isPlanetUnclaimed(s1 as Planet)) ||
      (isPlanetAndShip(s2, s1) && isPlanetUnclaimed(s2 as Planet))
    );
  }

  handleCollision(s1: Sprite, s2: Sprite): boolean {
    if (s1.type === SpriteType.Planet)
      return this.handleCollisionBetweenPlanetAndShip(s1 as Planet, s2 as Ship);
    else
      return this.handleCollisionBetweenPlanetAndShip(s2 as Planet, s1 as Ship);
  }

  // HERE
  handleCollisionBetweenPlanetAndShip(planet: Planet, ship: Ship): boolean {
    if (this.haveCollided(planet, ship, planet.outerRadius)) {
      planet.increaseClaim(ship.faction, 1 / 2);
      if (
        planet.claimedBy === ship.faction &&
        planet.planetType === PlanetType.Paradise
      ) {
        // TODO: extract to method
        let duration = Game.instance().story.play(
          this.scene,
          Story.FoundNewEarth
        );
        setTimeout(() => {
          planet.name = "orion (new earth)";
        }, duration * 1000);
        setTimeout(() => {
          Game.instance().goToGameOverScene({ win: true });
        }, duration * 1000 + 2000);
      }
      return true;
    }
    return false;
  }
}

function isPlanetAndShip(s1: Sprite, s2: Sprite) {
  return s1.type === SpriteType.Planet && s2.type === SpriteType.Ship;
}

function isPlanetUnclaimed(planet: Planet) {
  return planet.claimedBy === undefined;
}
