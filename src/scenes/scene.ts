import {
  Position,
  Positions,
  isObjectOutOfBounds,
  getCanvasPosition
} from "../utils";
import CollisionsEngine from "../collisions";
import Config from "../config";
import { Camera, createCamera } from "./camera";

export interface Sprites {
  background: Sprite[];
  foreground: Sprite[];
  shell: Sprite[];
}

export interface SpriteOptions {
  sceneLayer?: SceneLayer;
}

export enum SceneLayer {
  Background,
  Foreground,
  Shell
}

export interface Scene {
  sprites: Sprites;
  pools: Pool[];
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
  props?: any;
}

// Manages sprites and game loop within
// a single scene
export function createScene({
  camera = createCamera(),
  update = () => {},
  render = () => {},
  props = {}
}: SceneOptions = {}): Scene {
  const sprites: Sprites = { foreground: [], background: [], shell: [] };
  const pools: Pool[] = [];

  let loop = kontra.gameLoop({
    update(dt: number) {
      update.bind(this)(dt);

      // TODO: provide custom iterator to
      // allow to easy traverse all sprites
      // without having to create a new array
      this.sprites.background.forEach((s: Sprite) => s.update());
      this.sprites.foreground.forEach((s: Sprite) => s.update());
      this.pools.forEach((p: Pool) => p.update());
      this.sprites.shell.forEach((s: Sprite) => s.update());

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
      // background never out of bounds
      this.sprites.background.forEach((s: Sprite) => s.render());
      this.sprites.foreground
        .filter(
          (s: Sprite) =>
            !isObjectOutOfBounds(s, camera) &&
            s.type !== "ship" &&
            s.type !== "bullet"
        )
        .forEach((s: Sprite) => s.render());
      this.pools.forEach((p: Pool) => p.render());
      // make bullets part of the pool and remove this
      this.sprites.foreground
        .filter((s: Sprite) => s.type === "ship" || s.type === "bullet")
        .forEach((s: Sprite) => s.render());
      this.sprites.shell.forEach((s: Sprite) => s.render());
    }
  });

  // Extend game loop with scene
  // functionality. This defines the public
  // API of Scene
  let scene = Object.assign(loop, {
    pools,
    sprites,
    ...props,
    // TODO: this may not be necessary
    // consider removing to save space
    addSprite(
      this: Scene,
      sprite: Sprite,
      { sceneLayer = SceneLayer.Foreground }: SpriteOptions = {}
    ) {
      if (sceneLayer === SceneLayer.Foreground)
        this.sprites.foreground.push(sprite);
      else if (sceneLayer === SceneLayer.Shell) this.sprites.shell.push(sprite);
      else this.sprites.background.push(sprite);
    },
    cameraPosition: camera,
    logGameObjects
  });
  scene.collisionEngine = new CollisionsEngine(scene);

  if (Config.debug && Config.renderDebugData) {
    scene.addSprite(DebugInfoSprite(scene), { sceneLayer: SceneLayer.Shell });
  }

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

function DebugInfoSprite(scene: Scene): Sprite {
  return kontra.sprite({
    x: 40,
    y: Config.canvasHeight / 2,
    ttl: Infinity,
    render() {
      this.context.save();
      this.context.font = "normal normal 12px monospace";
      this.context.fillStyle = "white";
      let textToRender = `
camera : (${scene.cameraPosition.x}, ${scene.cameraPosition.y})
${getSpriteCount(scene.sprites.background)}
${getSpriteCount(scene.sprites.foreground)}
${getSpriteCount(scene.sprites.shell)}
      `;
      textToRender.split("\n").forEach((text, i) => {
        this.context.fillText(text, this.x, this.y + i * 10, 500);
      });
      this.context.restore();
    }
  });
}

function getSpriteCount(sprites: Sprite[]) {
  let spritesByType = sprites.reduce((map, sprite) => {
    if (!map.has(sprite.type)) map.set(sprite.type, 1);
    else {
      map.set(sprite.type, map.get(sprite.type) + 1);
    }
    return map;
  }, new Map());
  return Array.from(spritesByType.keys()).reduce((str, type) => {
    return str + `${type}: ${spritesByType.get(type)}\n`;
  }, ``);
}
