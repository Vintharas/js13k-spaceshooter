import Scene from "./scene";
import { createAsteroid } from "./asteroid";
import createShip from "./ship";
import createText from "./text";

export default function createSpaceScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);
  // initial state
  for (var i = 0; i < 4; i++) {
    let asteroid = createAsteroid(100, 100, 30);
    scene.addSprite(asteroid);
  }
  scene.addSprite(createShip(scene));

  return scene;

  function update() {
    scene.sprites.map(sprite => {
      sprite.update();
      // sprite is beyond the left edge
      if (sprite.x < 0) {
        sprite.x = kontra.canvas.width;
      }
      // sprite is beyond the right edge
      else if (sprite.x > kontra.canvas.width) {
        sprite.x = 0;
      }
      // sprite is beyond the top edge
      if (sprite.y < 0) {
        sprite.y = kontra.canvas.height;
      }
      // sprite is beyond the bottom edge
      else if (sprite.y > kontra.canvas.height) {
        sprite.y = 0;
      }
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
                    asteroid.radius / 2.5
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
    scene.sprites = scene.sprites.filter(sprite => sprite.isAlive());
  }

  // TODO: extract to scene
  function render() {
    scene.sprites.forEach(s => s.render());
  }
}
