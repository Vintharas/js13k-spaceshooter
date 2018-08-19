import Scene from "./scene";
import { createAsteroid } from "./asteroid";
import createShip from "./ship";
import { isObjectOutOfBounds, Position } from "./utils";
import createStar from "./star";

export default function createSpaceScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);
  const ship = createShip(scene);
  // initial state
  for (var i = -1000; i <= 1000; i += 100) {
    for (var j = -1000; j <= 1000; j += 100) {
      let star = createStar(i, j, ship);
      scene.addSprite(star);
    }
  }

  for (var i = 0; i < 4; i++) {
    let asteroid = createAsteroid(100, 100, 30, ship);
    scene.addSprite(asteroid);
  }
  scene.addSprite(ship);

  return scene;

  function update() {
    scene.sprites.map(sprite => {
      sprite.update();
    });

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
              sprite.ttl = 0;

              // split the asteroid only if it's large enough
              if (asteroid.radius > 10) {
                for (var x = 0; x < 3; x++) {
                  let newAsteroid = createAsteroid(
                    asteroid.x,
                    asteroid.y,
                    asteroid.radius / 2.5,
                    ship
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

    // remove sprites too far from camera
    cleanupObjectIfOutOfBounds(scene, this);

    scene.sprites = scene.sprites.filter(sprite => sprite.isAlive());
  }

  // TODO: extract to scene
  function render() {
    scene.sprites.forEach(s => s.render());
  }
}

function cleanupObjectIfOutOfBounds(scene: Scene, cameraPosition: Position) {
  scene.sprites.forEach((s: any) => {
    if (isObjectOutOfBounds(s, cameraPosition)) {
      s.ttl = 0;
    }
  });
}
