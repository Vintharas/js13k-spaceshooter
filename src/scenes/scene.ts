import { Position, Positions } from "../utils";
import Config from "../config";
import CollisionsEngine from "../collisions";
import { Camera, createCamera } from "./camera";

export interface Scene {
  sprites: Sprite[];
  update(dt: number): void;
  addSprite(sprite: Sprite): void;
  start(): void;
  stop(): void;
  cameraPosition: Position;
}
export interface SceneOptions {
  camera?: Camera;
  update?(dt: number): void;
  render?(): void;
}

// Manages sprites and game loop within
// a single scene
export function createScene({
  camera = createCamera(),
  update = () => {},
  render = () => {}
}: SceneOptions = {}): Scene {
  const sprites: Sprite[] = [];

  let loop = kontra.gameLoop({
    update(dt: number) {
      update.bind(this)(dt);
      this.sprites.forEach((s: Sprite) => s.update());
      this.collisionEngine.processCollisions(dt);
      if (Config.debug && Config.verbose) {
        this.logGameObjects();
      }
      this.sprites = this.sprites.filter((sprite: Sprite) => sprite.isAlive());
    },
    render() {
      render.bind(this)();
      this.sprites.forEach((s: Sprite) => s.render());
    }
  });

  // Extend game loop with scene
  // functionality
  let scene = Object.assign(loop, {
    sprites,
    // TODO: this may not be necessary
    // consider removing to save space
    addSprite(sprite: Sprite) {
      this.sprites.push(sprite);
    },
    cameraPosition: camera,
    logGameObjects
  });
  scene.collisionEngine = new CollisionsEngine(scene);

  return scene;
}

function logGameObjects() {
  let logPeriodSeconds = 1;
  this.dt += 1 / 60;
  if (this.dt >= logPeriodSeconds) {
    this.dt = 0;
    console.table(
      this.sprites
        .filter((s: any) => {
          let isLogged = Config.typesToLog.includes(s.type);
          if (Config.onlyLogInProximityToShip)
            isLogged =
              isLogged && Positions.areNear(s, this.cameraPosition, 50);
          return isLogged;
        })
        .map(Config.logTheseProperties)
    );
  }
}
