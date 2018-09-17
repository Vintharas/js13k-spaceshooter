import { Scene } from "../scenes/scene";
import { createAsteroid, Asteroid } from "../asteroid";
import {
  Position,
  getValueInRange,
  RGB,
  isObjectOutOfCollisionBounds
} from "../utils";
import Config from "../config";
import createCell, { CellType, Cell, getRandomCellType } from "../cell";
import { Ship } from "../ship/ship";
import { createText } from "../text";
import { Planet, PlanetType } from "../planet";
import { Sun } from "../sun";
import { Vector } from "../vector";
import { Bullet } from "../bullet";
import Game from "../game";
import { Story } from "../story";
import { Explosion } from "../effects/explosion";
import { CollisionStrategy } from "./CollisionStrategy";
import { NoopCollisionStrategy } from "./NoopCollisionStrategy";
import { DefaultCollisionStrategies } from "./DefaultCollisionStrategies";

let EnergyBoost = 20;
let LifeBoost = 10;

export class NewCollisionsEngine {
  private strategies: CollisionStrategy[] = [];
  private ship: Ship;
  private dt = 0;

  constructor(
    private scene: Scene,
    collisionStrategies = DefaultCollisionStrategies(scene)
  ) {
    this.strategies.push(...collisionStrategies);
  }

  processCollisions(dt: number) {
    this.dt += dt;

    this.initializeShip();
    // temporary hack to test something
    let collidableObjects = [
      ...this.scene.sprites.foreground,
      ...this.scene.sprites.activePoolObjects()
    ]
      .filter(s => !isObjectOutOfCollisionBounds(s, this.scene.cameraPosition))
      .filter(s => Config.collidableTypes.includes(s.type));

    // collision detection
    for (let i = 0; i < collidableObjects.length; i++) {
      for (let j = i + 1; j < collidableObjects.length; j++) {
        let strategy = this.findStrategyThatApplies(
          collidableObjects[i],
          collidableObjects[j]
        );
        if (
          strategy.handleCollision(
            collidableObjects[i],
            collidableObjects[j]
          ) &&
          collidableObjects[i].type !== SpriteType.Ship
        ) {
          // if there was a collision we don't need to check
          // that more objects collide with this one
          // unless it's the ship
          break;
        }
      }
    }
  }

  findStrategyThatApplies(s1: Sprite, s2: Sprite): CollisionStrategy {
    return this.strategies.find(strategy =>
      strategy.isApplicable(s1, s2, this.dt)
    );
  }

  initializeShip() {
    // TODO: we could inject this via constructor
    // if I untangle the dependency mess
    if (this.ship) return;

    let shipTypedSprites = this.scene.sprites.foreground.filter(
      (s: Sprite) => s.type === SpriteType.Ship
    ) as Ship[];
    if (shipTypedSprites.length > 0) [this.ship] = shipTypedSprites;
  }
}

/*
Improvements for collision engine:

- unify how we calculate collisions with all objects. Some of them have radius 
  others have width, size, etc. Provide a unified interface with a single property
  to take into account. Width is used by the framework and it make bet reset to something
  I don't control (like in the case of a sprite or with object pools)
- extract collision predicate into a function
- rewrite collision algorithm that traverses list of game objects and checks collisions
  between them.
- use enums instead of strings for type
- extract collision handlers into separate classes/functions that can also
  check whether the handler applies to a given collision.
  - 1. is there collision?
  - 2. is there a handler?
  - 3. apply handler
*/

export default class CollisionsEngine {
  private ship: Ship;
  private dt = 0;
  constructor(private scene: Scene) {}

  processCollisions(dt: number) {
    this.dt += dt;

    this.initializeShip();
    // temporary hack to test something
    let collidableObjects = [
      ...this.scene.sprites.foreground,
      ...this.scene.sprites.activePoolObjects()
    ]
      .filter(s => !isObjectOutOfCollisionBounds(s, this.scene.cameraPosition))
      .filter(s => Config.collidableTypes.includes(s.type))
      // with the current algorithm that
      // checks whether an asteroid has collided with X
      // we need to put all the asteroids first, otherwise
      // we won't calculate the collision of an asteroid with
      // the ship (this was a BUG that it took me a lot to find)
      // TODO: improve collision algorithm so that it doesn't
      // require sorting (we could use types to match to specific functions
      // and do one pass)
      .sort((a: Sprite, b: Sprite) => (a.type > b.type ? 1 : -1));

    // collision detection
    for (let i = 0; i < collidableObjects.length; i++) {
      // only check for collision against asteroids
      if (collidableObjects[i].type === SpriteType.Asteroid) {
        for (let j = i + 1; j < collidableObjects.length; j++) {
          // don't check asteroid vs. asteroid collisions
          if (collidableObjects[j].type !== SpriteType.Asteroid) {
            let asteroid = collidableObjects[i] as Asteroid;
            let sprite = collidableObjects[j] as Sprite;
            let collided = this.handleCollisionWithAsteroid(asteroid, sprite);
            if (collided) break;
          }
        }
      }

      if (collidableObjects[i].type === SpriteType.Bullet) {
        for (let j = i + 1; j < collidableObjects.length; j++) {
          // TODO: refactor, use enums
          // don't check collisions betwen bullets
          // asteroids have already been checked
          if (
            collidableObjects[j].type !== SpriteType.Bullet &&
            collidableObjects[i].type !== SpriteType.Asteroid
          ) {
            let bullet = collidableObjects[i] as Bullet;
            let sprite = collidableObjects[j] as Sprite;
            let collided = this.handleCollisionWithBullet(bullet, sprite);
            if (collided) break;
          }
        }
      }

      if (collidableObjects[i].type === SpriteType.Cell && this.ship) {
        // did it collide with the ship?
        // circle vs. circle collision detection
        let cell = collidableObjects[i] as Cell;
        this.handleCollisionBetweenCellAndShip(cell, this.ship);
      }

      if (collidableObjects[i].type === SpriteType.Planet && this.ship) {
        let planet = collidableObjects[i] as Planet;
        this.handleCollisionBetweenPlanetAndShip(planet, this.ship);
      }

      if (collidableObjects[i].type === SpriteType.Sun && this.ship) {
        let sun = collidableObjects[i] as Sun;
        this.handleCollisionBetweenSunAndShip(sun, this.ship);
      }
    }
  }

  initializeShip() {
    // TODO: we could inject this via constructor
    // if I untangle the dependency mess
    if (this.ship) return;

    let shipTypedSprites = this.scene.sprites.foreground.filter(
      (s: Sprite) => s.type === SpriteType.Ship
    ) as Ship[];
    if (shipTypedSprites.length > 0) [this.ship] = shipTypedSprites;
  }

  handleCollisionWithAsteroid(asteroid: Asteroid, sprite: Sprite): boolean {
    // circle vs. circle collision detection
    if (
      Vector.getDistanceMagnitude(asteroid, sprite) <
      asteroid.radius + sprite.width
    ) {
      if (![SpriteType.Ship, SpriteType.Bullet].includes(sprite.type)) return;

      asteroid.ttl = 0;
      if (sprite.type === SpriteType.Ship) {
        this.handleCollisionAsteroidWithShip(asteroid, sprite);
      } else if (sprite.type === SpriteType.Bullet) {
        sprite.ttl = 0;
      }

      // explosion
      // particle explosion
      this.addExplosion(this.scene, asteroid);

      // split the asteroid only if it's large enough
      if (asteroid.radius > 10) {
        breakAsteroidInSmallerOnes(asteroid, this.scene);
      }

      this.releaseCells(this.scene, asteroid);

      return true;
    } else {
      return false;
    }
  }

  handleCollisionWithBullet(bullet: Bullet, sprite: Sprite) {
    // circle vs. circle collision detection
    if (bullet.owner === sprite) return;
    if (bullet.owner.faction && bullet.owner.faction === sprite.faction) return;
    if (
      bullet.owner.type === SpriteType.Elder &&
      sprite.type === SpriteType.Elder
    )
      return;

    if (
      Vector.getDistanceMagnitude(bullet, sprite) <
      bullet.width + sprite.width / 2
    ) {
      // is it damageable?
      if (sprite.takeDamage) sprite.takeDamage(bullet.damage);
      bullet.ttl = 0;

      // add explosion when sprite doesn't have any life left
      if (sprite.ttl === 0)
        // particle explosion
        this.addExplosion(this.scene, sprite);
    }
  }

  handleCollisionAsteroidWithShip(asteroid: Asteroid, ship: any) {
    /*
    if (Config.debug)
      console.log("Asteroid collided with ship", asteroid, ship);
    */
    // the damage produced in the ship depends
    // on the size of the asteroid
    let damage = asteroid.radius * 4;
    ship.takeDamage(damage);
    if (ship.ttl === 0) {
      this.addExplosion(this.scene, ship);
    }
  }

  addExplosion(scene: Scene, sprite: Sprite) {
    let explosion = Explosion(scene, sprite);
    for (let particle of explosion.particles) scene.addSprite(particle);
  }

  releaseCells(scene: Scene, asteroid: Asteroid) {
    let numberOfEnergyCells = Math.round(getValueInRange(1, 3));
    // TODO: Extract all for loops into function that generate
    // n number of sprites and add them to the scene
    // using a factory function
    // Energy Cells
    for (let i = 0; i < numberOfEnergyCells; i++) {
      let newCell = createCell(asteroid, scene.cameraPosition, CellType.Energy);
      scene.addSprite(newCell);
    }

    //Life Cells
    let numerOfLifeCells = Math.round(getValueInRange(0, 1));
    for (let i = 0; i < numerOfLifeCells; i++) {
      let newCell = createCell(asteroid, scene.cameraPosition, CellType.Life);
      scene.addSprite(newCell);
    }
  }

  handleCollisionBetweenCellAndShip(cell: Cell, ship: Ship): void {
    let dx = cell.x - this.ship.x;
    let dy = cell.y - this.ship.y;
    if (
      Math.sqrt(dx * dx + dy * dy) <
      cell.outerRadius + this.ship.collisionWidth
    ) {
      cell.ttl = 0;
      // add energy or life to the ship
      if (cell.cellType === CellType.Energy) {
        let energyBoost = Math.ceil(getValueInRange(0, EnergyBoost));
        this.ship.energy.recharge(energyBoost);
        this.addBoostText(energyBoost, cell, ship, { r: 0, g: 255, b: 0 });
      } else if (cell.cellType === CellType.Life) {
        let lifeBoost = Math.ceil(getValueInRange(0, LifeBoost));
        this.ship.life.repair(lifeBoost);
        this.addBoostText(lifeBoost, cell, ship, { r: 255, g: 0, b: 0 });
      }
    }
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

  // TODO: it's about time to extract this into something it's own object
  // The collision engine could use collisionStrategies which would encapsulate
  // collision logic between entities
  handleCollisionBetweenPlanetAndShip(planet: Planet, ship: Ship): void {
    if (shipWithinRadius(ship, planet, planet.outerRadius)) {
      if (planet.claimedBy === ship.faction) {
        if (this.dt > 0.4) {
          this.dt = 0;
          // if it is a faction planet
          // then you get double the amount of energy/life
          let modifier =
            planet.planetType === Config.Factions[ship.faction].Planet ? 2 : 1;
          this.provideBoosts(ship, modifier);
        }
      } else {
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
      }
    }
  }

  handleCollisionBetweenSunAndShip(sun: Sun, ship: Ship): void {
    if (shipWithinRadius(ship, sun, sun.damageOuterRadius)) {
      if (this.dt > 0.4 && ship.ttl > 0) {
        this.dt = 0;
        ship.takeDamage(100);
        if (ship.ttl === 0) {
          this.addExplosion(this.scene, ship);
        }
      }
    } else if (shipWithinRadius(ship, sun, sun.energyOuterRadius)) {
      if (this.dt > 0.4) {
        this.dt = 0;
        // provide energy boost
        this.provideEnergyBoost(ship, /*modifier*/ 3);
      }
    }
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
    let energyBoost = Math.ceil(getValueInRange(0, EnergyBoost * modifier));
    ship.energy.recharge(energyBoost);
    this.addBoostText(energyBoost, ship, ship, { r: 0, g: 255, b: 0 });
  }
  provideLifeBoost(ship: Ship, modifier = 1) {
    let lifeBoost = Math.ceil(getValueInRange(0, LifeBoost * modifier));
    ship.life.repair(lifeBoost);
    this.addBoostText(lifeBoost, ship, ship, { r: 255, g: 0, b: 0 });
  }
}

function breakAsteroidInSmallerOnes(asteroid: any, scene: Scene) {
  for (let i = 0; i < 3; i++) {
    let newAsteroid = createAsteroid(
      asteroid,
      { dx: getValueInRange(-2, 2), dy: getValueInRange(-2, 2) },
      asteroid.radius / 2.5,
      scene.cameraPosition
    );
    scene.addSprite(newAsteroid);
  }
}

function shipWithinRadius(ship: Ship, sprite: Sprite, radius: number) {
  let dx = sprite.x - ship.x;
  let dy = sprite.y - ship.y;
  return Math.sqrt(dx * dx + dy * dy) < radius + ship.collisionWidth * 2;
}
