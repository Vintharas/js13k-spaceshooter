import { Position, Positions, isObjectOutOfBounds } from "../utils";
import CollisionsEngine from "../collisions";
import Config from "../config";
import { Camera, createCamera } from "./camera";

export interface Sprites {
  background: Sprite[];
  foreground: Sprite[];
}

export interface SpriteOptions {
  isInForeground?: boolean;
}

export interface Scene {
  sprites: Sprites;
  update(dt: number): void;
  addSprite(this: Scene, sprite: Sprite, options?: SpriteOptions): void;
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
  const sprites: Sprites = { foreground: [], background: [] };

  let loop = kontra.gameLoop({
    update(dt: number) {
      update.bind(this)(dt);

      // TODO: provide custom iterator to
      // allow to easy traverse all sprites
      // without having to create a new array
      this.sprites.background.forEach((s: Sprite) => s.update());
      this.sprites.foreground.forEach((s: Sprite) => s.update());

      this.collisionEngine.processCollisions(dt);
      if (Config.debug && Config.verbose) {
        this.logGameObjects();
      }

      this.sprites.foreground = this.sprites.foreground.filter(
        (sprite: Sprite) => sprite.isAlive()
      );
    },
    render() {
      render.bind(this)();
      this.sprites.background
        .filter((s: Sprite) => !isObjectOutOfBounds(s, camera))
        .forEach((s: Sprite) => s.render());
      this.sprites.foreground
        .filter((s: Sprite) => !isObjectOutOfBounds(s, camera))
        .forEach((s: Sprite) => s.render());
    }
  });

  // Extend game loop with scene
  // functionality
  let scene = Object.assign(loop, {
    sprites,
    // TODO: this may not be necessary
    // consider removing to save space
    addSprite(
      this: Scene,
      sprite: Sprite,
      { isInForeground = true }: SpriteOptions = {}
    ) {
      if (isInForeground) this.sprites.foreground.push(sprite);
      else this.sprites.background.push(sprite);
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
