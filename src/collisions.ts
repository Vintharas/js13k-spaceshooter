import Scene from "./scene";
import { createAsteroid, Asteroid } from "./asteroid";
import { Position, getValueInRange, Sprite, RGB } from "./utils";
import Config from "./config";
import { createExplosionParticle } from "./particles";
import createCell, { CellType, Cell, getRandomCellType } from "./cell";
import { Ship } from "./ship";
import createText from "./text";
import { Planet } from "./planet";

export default class CollisionsEngine {
  private ship: Ship;
  private dt = 0;
  constructor(private scene: Scene) {}

  processCollisions(dt: number) {
    this.dt += dt;

    this.initializeShip();
    // temporary hack to test something
    let collidableObjects = this.scene.sprites
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
      if (collidableObjects[i].type === "asteroid") {
        for (let j = i + 1; j < collidableObjects.length; j++) {
          // don't check asteroid vs. asteroid collisions
          if (collidableObjects[j].type !== "asteroid") {
            let asteroid = collidableObjects[i];
            let sprite = collidableObjects[j];
            let collided = this.handleCollisionWithAsteroid(asteroid, sprite);
            if (collided) break;
          }
        }
      }

      if (collidableObjects[i].type === "cell" && this.ship) {
        // did it collide with the ship?
        // circle vs. circle collision detection
        let cell = collidableObjects[i];
        this.handleCollisionBetweenCellAndShip(cell, this.ship);
      }

      if (collidableObjects[i].type === "planet" && this.ship) {
        let planet = collidableObjects[i];
        this.handleCollisionBetweenPlanetAndShip(planet, this.ship);
      }
    }
  }

  initializeShip() {
    // TODO: we could inject this via constructor
    // if I untangle the dependency mess
    if (this.ship) return;

    let shipTypedSprites = this.scene.sprites.filter(
      (s: Sprite) => s.type === "ship"
    );
    if (shipTypedSprites.length > 0) [this.ship] = shipTypedSprites;
  }

  handleCollisionWithAsteroid(asteroid: any, sprite: any): boolean {
    // circle vs. circle collision detection
    let dx = asteroid.x - sprite.x;
    let dy = asteroid.y - sprite.y;
    if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius + sprite.width) {
      if (!["ship", "bullet"].includes(sprite.type)) return;

      asteroid.ttl = 0;
      if (sprite.type === "ship") {
        this.handleCollisionAsteroidWithShip(asteroid, sprite);
      } else if (sprite.type === "bullet") {
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

  handleCollisionAsteroidWithShip(asteroid: Asteroid, ship: any) {
    if (Config.debug)
      console.log("Asteroid collided with ship", asteroid, ship);
    // the damage produced in the ship depends
    // on the size of the asteroid
    let damage = asteroid.radius * 4;
    if (ship.shield.get() > 0) {
      ship.shield.damage(damage);
      if (ship.shield.get() <= 0) {
        // do some remaining damage to ship but less
        ship.life.damage(damage / 4);
      }
    } else {
      ship.life.damage(damage);
    }
    if (ship.life.get() <= 0) {
      if (Config.debug) console.log("SHIP DIED");
      ship.ttl = 0; // game over mothafucka!
    }
  }

  addExplosion(scene: Scene, asteroid: Asteroid) {
    // TODO: extract colors and selection
    // to a helper function
    let red = { r: 255, g: 0, b: 0 };
    let orange = { r: 255, g: 165, b: 0 };
    let yellow = { r: 255, g: 255, b: 0 };
    let explosionColors = [red, orange, yellow];
    for (let i = 0; i < asteroid.radius * 10; i++) {
      let colorIndex = Math.round(Math.random() * 2);
      let particle = createExplosionParticle(asteroid, scene.cameraPosition, {
        ttl: 50,
        color: explosionColors[colorIndex],
        magnitude: asteroid.radius / 2
      });
      scene.sprites.push(particle);
    }
  }

  releaseCells(scene: Scene, asteroid: Asteroid) {
    let numberOfEnergyCells = Math.round(getValueInRange(1, 3));
    // TODO: Extract all for loops into function that generate
    // n number of sprites and add them to the scene
    // using a factory function
    // Energy Cells
    for (let i = 0; i < numberOfEnergyCells; i++) {
      let newCell = createCell(asteroid, scene.cameraPosition, CellType.Energy);
      scene.sprites.push(newCell);
    }

    //Life Cells
    let numerOfLifeCells = Math.round(getValueInRange(0, 1));
    for (let i = 0; i < numerOfLifeCells; i++) {
      let newCell = createCell(asteroid, scene.cameraPosition, CellType.Life);
      scene.sprites.push(newCell);
    }
  }

  handleCollisionBetweenCellAndShip(cell: Cell, ship: Ship): void {
    let dx = cell.x - this.ship.x;
    let dy = cell.y - this.ship.y;
    if (
      Math.sqrt(dx * dx + dy * dy) <
      Config.Cell.OuterRadius + this.ship.collisionWidth * 2
    ) {
      cell.ttl = 0;
      // add energy or life to the ship
      if (cell.cellType === CellType.Energy) {
        let energyBoost = Math.ceil(
          getValueInRange(0, Config.Cell.EnergyBoost)
        );
        this.ship.energy.recharge(energyBoost);
        this.addBoostText(energyBoost, cell, ship, { r: 0, g: 255, b: 0 });
      } else if (cell.cellType === CellType.Life) {
        let lifeBoost = Math.ceil(getValueInRange(0, Config.Cell.LifeBoost));
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
    this.scene.sprites.push(cellText);
    if (Config.debug) console.log("Created cell text:", cellText);
  }

  // TODO: it's about time to extract this into something it's own object
  // The collision engine could use collisionStrategies which would encapsulate
  // collision logic between entities
  handleCollisionBetweenPlanetAndShip(planet: Planet, ship: Ship): void {
    let dx = planet.x - ship.x;
    let dy = planet.y - ship.y;

    if (planetAndShipCollided(planet, ship)) {
      if (planet.claimedBy === ship.faction) {
        if (this.dt > 0.4) {
          this.dt = 0;
          this.provideBoosts(ship);
        }
      } else {
        planet.increaseClaim(ship.faction, 1 / 2);
      }
    }
    function planetAndShipCollided(planet: Planet, ship: Ship) {
      return (
        Math.sqrt(dx * dx + dy * dy) <
        planet.outerRadius + ship.collisionWidth * 2
      );
    }
  }

  provideBoosts(ship: Ship) {
    let cellType = getRandomCellType();
    // add energy or life to the ship
    if (cellType === CellType.Energy) {
      let energyBoost = Math.ceil(getValueInRange(0, Config.Cell.EnergyBoost));
      ship.energy.recharge(energyBoost);
      this.addBoostText(energyBoost, ship, ship, { r: 0, g: 255, b: 0 });
    } else if (cellType === CellType.Life) {
      let lifeBoost = Math.ceil(getValueInRange(0, Config.Cell.LifeBoost));
      ship.life.repair(lifeBoost);
      this.addBoostText(lifeBoost, ship, ship, { r: 255, g: 0, b: 0 });
    }
  }
}

function breakAsteroidInSmallerOnes(asteroid: any, scene: Scene) {
  if (Config.debug)
    console.log("Asteroid destroyed. Creating smaller asteroids", asteroid);

  for (let i = 0; i < 3; i++) {
    let newAsteroid = createAsteroid(
      asteroid,
      { dx: getValueInRange(-2, 2), dy: getValueInRange(-2, 2) },
      asteroid.radius / 2.5,
      scene.cameraPosition
    );
    scene.sprites.push(newAsteroid);
    if (Config.debug) console.log("New Asteroid", newAsteroid);
  }
}
