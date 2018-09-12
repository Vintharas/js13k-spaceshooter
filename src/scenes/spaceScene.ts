import { Scene, createScene, SceneLayer } from "./scene";
import { createAsteroid } from "../asteroid";
import createShip, { Ship } from "../ship/ship";
import { isObjectOutOfBounds, Position, getValueInRange } from "../utils";
import Game from "../game";
import Config from "../config";
import { createCamera } from "./camera";
import { Sector } from "../map/sector";
import { SpaceBackground } from "../background";
import { GameData } from "../data/gamedata";
import { ElderPool, ElderType } from "../enemies/elder";
import { PlanetType } from "../planet";
import { createGameStatusText, Message, MessageType } from "../text";
import { Counter } from "../counter";

export default function createSpaceScene(gameData: GameData) {
  let game = Game.instance();
  let camera = createCamera();
  let scene = createScene({
    camera,
    props: { isTransitioningToGameOver: false },
    update() {
      if (!ship.isAlive()) {
        if (this.isTransitioningToGameOver) return;
        this.isTransitioningToGameOver = true;
        setTimeout(() => {
          game.goToGameOverScene();
        }, 2000);
      }
      // remove sprites too far from camera
      // TODO: enable this as soon as I implement
      // support for pools and rehidrating objects
      // cleanupObjectIfOutOfBounds(scene);
    }
  });

  let ship = createShip(scene, gameData.faction);
  camera.position = ship;

  // initial state
  addBackground(scene, ship);
  addSector(scene, ship);
  addAsteroids(scene, ship);
  addStaticAsteroids(scene, ship);

  // add enemies for testing
  addEnemies(scene, ship);

  scene.addSprite(ship);

  // setup earth animation
  game.gameData.earth.changePlanetTo(PlanetType.Red);
  game.story.playIntro(scene);

  // add counter after intro is played
  setTimeout(() => {
    let counter = Counter(10, Config.canvasHeight - 10, 15);
    scene.addSprite(counter, { sceneLayer: SceneLayer.Shell });
  }, 14 * 2 * 1000);

  return scene;
}

/*
function cleanupObjectIfOutOfBounds(scene: Scene) {
  // TODO: see how I can make better use of object pool
  // from kontra.js. This could be something I could take advantage of here
  scene.sprites.foreground.forEach((s: any) => {
    if (isObjectOutOfBounds(s, scene.cameraPosition)) {
      s.ttl = 0;
      //if (Config.debug) console.log(`Object ${s.type} out of bounds`, s);
    }
  });
}
*/

function addBackground(scene: Scene, cameraPosition: Position) {
  let background = SpaceBackground(cameraPosition);
  scene.addSprite(background, { sceneLayer: SceneLayer.Background });
}

function addAsteroids(scene: Scene, cameraPosition: Position) {
  let maxNumberOfClusters = 5;
  let maxNumberOfAsteroidsPerCluster = 5;
  // create some clusters of varying sizes
  for (let i = 0; i < maxNumberOfClusters; i++) {
    let clusterSize = Math.ceil(
      getValueInRange(0, maxNumberOfAsteroidsPerCluster)
    );
    addAsteroidCluster(scene, cameraPosition, clusterSize);
  }
}

function addStaticAsteroids(scene: Scene, cameraPosition: Position) {
  let maxNumberOfClusters = 5;
  let maxNumberOfAsteroidsPerCluster = 5;
  // create some clusters of varying sizes
  for (let i = 0; i < maxNumberOfClusters; i++) {
    let clusterSize = Math.ceil(
      getValueInRange(0, maxNumberOfAsteroidsPerCluster)
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

function addSector(scene: Scene, cameraPosition: Position) {
  // this will create 100 sectors right now
  let galaxySize = 100000;
  let sectorSize = 10000;
  for (let x = -galaxySize / 2; x < galaxySize / 2; x += sectorSize) {
    for (let y = -galaxySize / 2; y < galaxySize / 2; y += sectorSize) {
      let sector;
      if (x === 0 && y === 0) {
        // create sun sector
        sector = Sector(scene, { x, y }, cameraPosition, "sun");
        Game.instance().gameData.earth = sector.planets.find(
          p => p.name === "*earth*"
        );
      } else {
        sector = Sector(scene, { x, y }, cameraPosition);
      }
      sector.bodies.forEach(s => scene.addSprite(s));
    }
  }
}

function addEnemies(scene: Scene, ship: Ship) {
  let elderPool = ElderPool(scene, ship);

  elderPool.get({
    x: 300,
    y: 300,
    ttl: Infinity,
    dx: 0,
    dy: 0,
    elderType: ElderType.MotherShip
  });

  for (let x = 0; x <= 60; x += 20) {
    elderPool.get({
      x: 200 + x,
      y: 200 + x,
      ttl: Infinity,
      dx: 0,
      dy: 0,
      elderType: ElderType.Sentry,
      patrolTarget: elderPool
        .getAliveObjects()
        .filter(s => s.elderType === ElderType.MotherShip)[0],
      patrolOrbit: 100 + x,
      angle: x
    });
  }

  for (let x = 0; x < 500; x += 100) {
    elderPool.get({
      x,
      y: x,
      ttl: Infinity,
      dx: 0,
      dy: 0,
      elderType: ElderType.Drone,
      patrolTarget: elderPool
        .getAliveObjects()
        .filter(s => s.elderType === ElderType.MotherShip)[0]
    });
  }

  scene.addPool(elderPool);
}
