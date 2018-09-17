import { CollisionStrategy } from "./CollisionStrategy";
import { Ship } from "../ship/ship";
import { Cell, CellType } from "../cell";
import { CollisionMethods } from "./CollisionMethods";
import { getValueInRange, RGB } from "../utils";
import { createText } from "../text";
import Config from "../config";
import { Scene } from "../scenes/scene";

export class CellCollisionStrategy implements CollisionStrategy {
  private haveCollided = CollisionMethods.CircleCollision.haveCollided;

  constructor(private scene: Scene) {}

  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return isCellAndShip(s1, s2) || isCellAndShip(s2, s1);
  }

  handleCollision(s1: Sprite, s2: Sprite): boolean {
    if (s1.type === SpriteType.Cell)
      return this.handleCollisionBetweenCellAndShip(s1 as Cell, s2 as Ship);
    else return this.handleCollisionBetweenCellAndShip(s2 as Cell, s1 as Ship);
  }

  handleCollisionBetweenCellAndShip(cell: Cell, ship: Ship): boolean {
    let dx = cell.x - ship.x;
    let dy = cell.y - ship.y;
    if (this.haveCollided(cell, ship)) {
      cell.ttl = 0;
      // add energy or life to the ship
      if (cell.cellType === CellType.Energy) {
        let energyBoost = Math.ceil(
          getValueInRange(0, Config.Cell.EnergyBoost)
        );
        ship.energy.recharge(energyBoost);
        this.addBoostText(energyBoost, cell, ship, { r: 0, g: 255, b: 0 });
      } else if (cell.cellType === CellType.Life) {
        let lifeBoost = Math.ceil(getValueInRange(0, Config.Cell.LifeBoost));
        ship.life.repair(lifeBoost);
        this.addBoostText(lifeBoost, cell, ship, { r: 255, g: 0, b: 0 });
      }

      return true;
    }
    return false;
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

function isCellAndShip(s1: Sprite, s2: Sprite) {
  return s1.type !== SpriteType.Cell && s2.type === SpriteType.Ship;
}
