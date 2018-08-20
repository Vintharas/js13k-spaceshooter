import Scene from "./scene";
import { createAsteroid } from "./asteroid";
import createShip from "./ship";
import { isObjectOutOfBounds, Position, getValueInRange } from "./utils";
import createStar from "./star";
import Config from "./config";
import Game from "./game";

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

    scene.processCollisions();

    if (!ship.isAlive()) {
      Game.instance().goToGameOverScene();
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
  for (let i = 0; i < Config.initialNumberOfClusters; i++) {
    let clusterSize = Math.ceil(
      getValueInRange(0, Config.maxAsteroidClusterSize)
    );
    addAsteroidCluster(scene, cameraPosition, clusterSize);
  }
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
