import { BaseCollisionStrategy } from "./CollisionStrategy";
import { Asteroid, createAsteroid } from "../asteroid";
import { CollisionMethods } from "./CollisionMethods";
import { Explosion } from "../effects/explosion";
import { Scene } from "../scenes/scene";
import { getValueInRange } from "../utils";
import createCell, { CellType } from "../cell";

export class AsteroidCollisionStrategy extends BaseCollisionStrategy {
  private haveCollided = CollisionMethods.CircleCollision.haveCollided;

  constructor(private scene: Scene) {
    super();
  }

  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return s1.type === SpriteType.Asteroid;
  }

  handleCollision(s1: Asteroid, s2: Sprite): boolean {
    return this.handleCollisionWithAsteroid(s1, s2);
  }

  handleCollisionWithAsteroid(asteroid: Asteroid, sprite: Sprite): boolean {
    // circle vs. circle collision detection
    if (this.haveCollided(asteroid, sprite)) {
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
    Explosion(scene, sprite);
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
