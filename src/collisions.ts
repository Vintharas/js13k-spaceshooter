import Scene from "./scene";
import { createAsteroid } from "./asteroid";
import { Position, getValueInRange } from "./utils";
import Config from "./config";

export default class CollisionsEngine {
  constructor(private scene: Scene, private cameraPosition: Position) {}

  processCollisions() {
    let scene = this.scene;
    // collision detection
    for (let i = 0; i < scene.sprites.length; i++) {
      // only check for collision against asteroids
      if (scene.sprites[i].type === "asteroid") {
        for (let j = i + 1; j < scene.sprites.length; j++) {
          // don't check asteroid vs. asteroid collisions
          if (scene.sprites[j].type !== "asteroid") {
            let asteroid = scene.sprites[i];
            let sprite = scene.sprites[j];
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
                for (var x = 0; x < 3; x++) {
                  let newAsteroid = createAsteroid(
                    asteroid,
                    { dx: getValueInRange(-2, 2), dy: getValueInRange(-2, 2) },
                    asteroid.radius / 2.5,
                    this.cameraPosition
                  );
                  scene.sprites.push(newAsteroid);
                }
              }

              break;
            }
          }
        }
      }
    }
  }
}
