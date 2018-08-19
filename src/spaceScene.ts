import Scene from "./scene";
import { createAsteroid } from "./asteroid";
import createShip from "./ship";
import { isObjectOutOfBounds, Position, getValueInRange } from "./utils";
import createStar from "./star";
import Config from "./config";

export default function createSpaceScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);
  const ship = createShip(scene);
  // initial state
  addStars(scene, ship);
  addAsteroids(scene, ship);
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
                    asteroid,
                    { dx: getValueInRange(-2, 2), dy: getValueInRange(-2, 2) },
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
      if (Config.debug) console.log(`Object ${s.type} out of bounds`, s);
    }
  });
}

// creates initial amount of stars surrounding the spaceship
function addStars(scene: Scene, cameraPosition: Position) {
  let spaceBetweenStars = 50;
  for (var i = -1000; i <= 1000; i += spaceBetweenStars) {
    for (var j = -1000; j <= 1000; j += spaceBetweenStars) {
      let star = createStar(i, j, cameraPosition);
      scene.addSprite(star);
    }
  }
}

function addAsteroids(scene: Scene, cameraPosition: Position) {
  // create some clusters of varying sizes
  for (let i = 0; i < 10; i++) addAsteroidCluster(scene, cameraPosition, i);
}

// creates a cluster of asteroids and adds it to the scene
function addAsteroidCluster(
  scene: Scene,
  cameraPosition: Position,
  clusterSize: number
) {
  let x = getValueInRange(-1000, 1000);
  let y = getValueInRange(-1000, 1000);
  let dx = getValueInRange(-2, 2);
  let dy = getValueInRange(-2, 2);
  for (var i = 0; i < clusterSize; i++) {
    let radius = getValueInRange(0, 30);
    let offsetX = getValueInRange(-100, 100);
    let offsetY = getValueInRange(-100, 100);
    let doffset = getValueInRange(-0.25, 0.25);

    let asteroid = createAsteroid(
      { x: x + offsetX, y: y + offsetY },
      { dx: dx + doffset, dy: dy + doffset },
      radius,
      cameraPosition
    );
    scene.addSprite(asteroid);
  }
}
