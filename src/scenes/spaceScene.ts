import { Scene, createScene, SceneLayer } from "./scene";
import { createAsteroid } from "../asteroid";
import createShip, { Ship } from "../ship/ship";
import { Position, getValueInRange, getIntegerInRange } from "../utils";
import Game from "../game";
import Config from "../config";
import { createCamera } from "./camera";
import { Sector } from "../map/sector";
import { SpaceBackground } from "../background";
import { GameData } from "../data/gamedata";
import { ElderPool, ElderType } from "../enemies/elder";
import { PlanetType } from "../planet";
import { Counter } from "../counter";
import { Story } from "../story";

export default function createSpaceScene(gameData: GameData) {
  let game = Game.instance();
  let camera = createCamera();
  let scene = createScene({
    camera,
    props: {
      shipDestroyedEndingPlayed: false,
      counterNearEndingPlayed: false,
      counterEndingPlayed: false,
      checkCounterNearEnding() {
        if (counter.seconds <= 0 && !this.counterNearEndingPlayed) {
          this.counterNearEndingPlayed = true;
          game.story.play(scene, Story.CounterNearEnding);
        }
      },
      checkCounterIsFinished() {
        if (counter.seconds <= 0 && !this.counterEndingPlayed) {
          this.counterEndingPlayed = true;
          let duration = game.story.play(scene, Story.EndingCounterFinished);
          this.goToGameOver(duration);
        }
      },
      checkShipIsAlive() {
        if (!ship.isAlive() && !this.shipDestroyedEndingPlayed) {
          this.shipDestroyedEndingPlayed = true;
          let duration = game.story.play(scene, Story.ShipDestroyedEnding);
          this.goToGameOver(duration);
        }
      },
      goToGameOver(seconds: number) {
        setTimeout(() => {
          game.goToGameOverScene();
        }, seconds * 1000);
      }
    },
    update() {
      this.checkCounterNearEnding();
      this.checkCounterIsFinished();
      this.checkShipIsAlive();
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

  // add enemies for testing
  addEnemies(scene, ship);

  scene.addSprite(ship);

  // setup earth animation
  game.gameData.earth.changePlanetTo(PlanetType.Scorched);
  let duration = game.story.play(scene, Story.Intro);

  let counter = Counter(10, Config.canvasHeight - 10, 15);
  // add counter after intro is played
  setTimeout(() => {
    scene.addSprite(counter, { sceneLayer: SceneLayer.Shell });
    counter.start();
  }, duration * 1000);

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

function addAsteroids(
  scene: Scene,
  cameraPosition: Position,
  sectorX: number,
  sectorY: number
) {
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
      /*isStatic*/ false,
      /*separation*/ 100,
      sectorX,
      sectorY
    );
  }
}

function addStaticAsteroids(
  scene: Scene,
  cameraPosition: Position,
  sectorX: number,
  sectorY: number
) {
  let maxNumberOfClusters = 20;
  let maxNumberOfAsteroidsPerCluster = 7;
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
      /*separation*/ 100,
      sectorX,
      sectorY
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
  separation: number = 100,
  sectorX = 0,
  sectorY = 0
) {
  let x = sectorX + getValueInRange(-10000, 10000);
  let y = sectorY + getValueInRange(-10000, 10000);

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
  let galaxySize = 100000; // - 50K to 50K
  let sectorSize = 10000;

  let { paradiseSectorX, paradiseSectorY } = getParadiseSectorCoordinates();
  for (let x = -galaxySize / 2; x < galaxySize / 2; x += sectorSize) {
    for (let y = -galaxySize / 2; y < galaxySize / 2; y += sectorSize) {
      let sector = createSector(
        scene,
        cameraPosition,
        { x, y },
        { x: paradiseSectorX, y: paradiseSectorY }
      );
      sector.bodies.forEach(s => scene.addSprite(s));
      addStaticAsteroids(scene, cameraPosition, x, y);
      if (x === 0 && y === 0) {
        // only add moving asteroids in the current sector
        addAsteroids(scene, cameraPosition, x, y);
      }
    }
  }
}

function createSector(
  scene: Scene,
  cameraPosition: Position,
  pos: Position,
  paradiseSectorPosition: Position
) {
  let sector;
  if (pos.x === 0 && pos.y === 0) {
    // create sun sector
    sector = Sector(scene, pos, cameraPosition, "sun");
    Game.instance().gameData.earth = sector.planets.find(
      p => p.name === "*earth*"
    );
  } else if (
    pos.x === paradiseSectorPosition.x &&
    pos.y === paradiseSectorPosition.y
  ) {
    // test creating paradise planet here
    sector = Sector(scene, pos, cameraPosition, "orion");
    Game.instance().gameData.orion = sector.planets.find(
      p => p.name === "orion"
    );
    console.log(Game.instance().gameData);
  } else {
    sector = Sector(scene, pos, cameraPosition);
  }
  return sector;
}

function getParadiseSectorCoordinates() {
  let paradiseSectorX = 0;
  let paradiseSectorY = 0;
  while (paradiseSectorX == 0 && paradiseSectorY == 0) {
    paradiseSectorX = getIntegerInRange(-5, 4) * 10000;
    paradiseSectorY = getIntegerInRange(-5, 4) * 10000;
  }
  return { paradiseSectorX, paradiseSectorY };
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
