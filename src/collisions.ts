import Scene from "./scene";
import { createAsteroid } from "./asteroid";
import { Position, getValueInRange } from "./utils";
import Config from "./config";

export default class CollisionsEngine {
  constructor(private scene: Scene) {}

  processCollisions() {
    let scene = this.scene;
    // temporary hack to test something
    let collidableObjects = scene.sprites.filter(s =>
      Config.collidableTypes.includes(s.type)
    );

    // collision detection
    for (let i = 0; i < collidableObjects.length; i++) {
      // only check for collision against asteroids
      if (collidableObjects[i].type === "asteroid") {
        for (let j = i + 1; j < collidableObjects.length; j++) {
          // don't check asteroid vs. asteroid collisions
          if (collidableObjects[j].type !== "asteroid") {
            let asteroid = collidableObjects[i];
            let sprite = collidableObjects[j];
            // circle vs. circle collision detection
            let dx = asteroid.x - sprite.x;
            let dy = asteroid.y - sprite.y;
            if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius + sprite.width) {
              asteroid.ttl = 0;

              if (sprite.type === "ship") {
                let ship = sprite;
                if (Config.debug)
                  console.log("Asteroid collided with ship", asteroid, ship);
                // the damage produced in the ship depends
                // on the size of the asteroid
                let damage = asteroid.radius * 4;
                ship.life.damage(damage);
                if (ship.life.get() <= 0) {
                  if (Config.debug) console.log("SHIP DIED");
                  ship.ttl = 0; // game over mothafucka!
                }
              } else {
                sprite.ttl = 0;
              }

              // split the asteroid only if it's large enough
              if (asteroid.radius > 10) {
                breakAsteroidInSmallerOnes(asteroid, scene);
              }

              // what the heck is this break doing here?
              // if this object has already collided with another object
              // then there's no need to check more (since the item will be destroyed)
              break;
            }
          }
        }
      }
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
  }
}
