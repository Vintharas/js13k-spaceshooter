import { Scene, createScene } from "./scene";
import { createAsteroid } from "../asteroid";
import createShip from "../ship/ship";
import { isObjectOutOfBounds, Position, getValueInRange } from "../utils";
import createStar from "../star";
import Config from "../config";
import Game from "../game";
import { createPlanet } from "../planet";
import { createCamera } from "./camera";

export default function createSpaceScene() {
  const camera = createCamera();
  const scene = createScene({ camera, update });
  const ship = createShip(scene);
  camera.position = ship;

  // initial state
  addStars(scene, ship);
  addPlanets(scene, ship);
  addAsteroids(scene, ship);
  addStaticAsteroids(scene, ship);
  scene.addSprite(ship);

  return scene;

  function update(dt: number) {
    if (!ship.isAlive()) {
      Game.instance().goToGameOverScene();
    }
    // remove sprites too far from camera
    cleanupObjectIfOutOfBounds(scene);
  }
}

function cleanupObjectIfOutOfBounds(scene: Scene) {
  // TODO: see how I can make better use of object pool
  // from kontra.js. This could be something I could take advantage of here
  scene.sprites.foreground.forEach((s: any) => {
    if (isObjectOutOfBounds(s, scene.cameraPosition)) {
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
      scene.addSprite(star, { isInForeground: false });
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

function addStaticAsteroids(scene: Scene, cameraPosition: Position) {
  // create some clusters of varying sizes
  for (let i = 0; i < Config.initialNumberOfClusters; i++) {
    let clusterSize = Math.ceil(
      getValueInRange(0, Config.maxAsteroidClusterSize)
    );
    addAsteroidCluster(
      scene,
      cameraPosition,
      clusterSize,
      /*isStatic*/ true,
      /*separation*/ 500
    );
  }
}

// creates a cluster of asteroids and adds it to the scene
function addAsteroidCluster(
  scene: Scene,
  cameraPosition: Position,
  // extract to object
  clusterSize: number,
  isStatic: boolean = false,
  separation: number = 100
) {
  let x = getValueInRange(-1000, 1000);
  let y = getValueInRange(-1000, 1000);

  let dx = 0;
  let dy = 0;
  if (!isStatic) {
    dx = getValueInRange(-2, 2);
    dy = getValueInRange(-2, 2);
  }

  for (var i = 0; i < clusterSize; i++) {
    let radius = getValueInRange(0, 30);
    let offsetX = getValueInRange(-separation, separation);
    let offsetY = getValueInRange(-separation, separation);

    let doffset = 0;
    if (!isStatic) {
      doffset = getValueInRange(-0.25, 0.25);
    }

    let asteroid = createAsteroid(
      { x: x + offsetX, y: y + offsetY },
      { dx: dx + doffset, dy: dy + doffset },
      radius,
      cameraPosition
    );
    scene.addSprite(asteroid);
  }
}

function addPlanets(scene: Scene, cameraPosition: Position) {
  let spaceBetweenPlanets = 900;
  for (let x = -1000; x <= 1000; x += spaceBetweenPlanets) {
    for (let y = -1000; y <= 1000; y += spaceBetweenPlanets) {
      let radius = getValueInRange(50, 100);
      let planet = createPlanet({ x, y }, radius, cameraPosition, scene);
      scene.addSprite(planet);
    }
  }
}
