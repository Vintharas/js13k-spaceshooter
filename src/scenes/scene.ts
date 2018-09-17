import { Position, Positions, isObjectOutOfRenderBounds } from "../utils";
import CollisionsEngine from "../collisions/collisionsEngine";
import Config from "../config";
import { Camera, createCamera } from "./camera";
import { createGameStatusText, Message } from "../text";
import { after } from "../fp";
import { doThisEvery } from "../Time";

export class Sprites {
  background: Sprite[] = [];
  foreground: Sprite[] = [];
  shell: Sprite[] = [];
  pools: Pool[] = [];

  [Symbol.iterator]() {
    return [
      ...this.background,
      ...this.foreground,
      ...this.pools,
      ...this.shell
    ][Symbol.iterator]();
  }

  *allSprites(): IterableIterator<Sprite> {
    yield* this.background;
    yield* this.foreground;
    yield* this.activePoolObjects();
    yield* this.shell;
  }

  activePoolObjects(this: Sprites): Sprite[] {
    return this.pools
      .map(p => p.getAliveObjects())
      .reduce((arr, acc) => [...acc, ...arr], []);
  }
}

export interface SpriteOptions {
  sceneLayer?: SceneLayer;
}

export const enum SceneLayer {
  Background,
  Foreground,
  Shell
}

export interface Scene {
  sprites: Sprites;
  pools: Pool[];
  messageQueue: Message[];
  showMessage(...text: Message[]): void;
  activePoolObjects(): Sprite[];
  update(dt: number): void;
  addSprite(this: Scene, sprite: Sprite, options?: SpriteOptions): void;
  addPool(this: Scene, pool: Pool): void;
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
  let sprites = new Sprites();

  let loop = kontra.gameLoop({
    update: after(update, updateLoop, showMessageWhenAvailable()),
    render: after(render, renderLoop)
  });

  // Extend game loop with scene
  // functionality. This defines the public
  // API of Scene
  let scene = Object.assign(loop, {
    messageQueue: [],
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
    addPool(this: Scene, pool: Pool) {
      this.sprites.pools.push(pool);
    },
    cameraPosition: camera,
    logGameObjects,
    showMessage(this: Scene, ...text: Message[]) {
      if (
        this.messageQueue.length === 0 &&
        !this.sprites.shell.find(s => s.type === SpriteType.Text)
      ) {
        let first;
        [first, ...text] = text;
        let firstText = createGameStatusText(first.text, first.type);
        this.addSprite(firstText, { sceneLayer: SceneLayer.Shell });
      }
      text.forEach(t => this.messageQueue.push(t));
    }
  });
  scene.collisionEngine = new CollisionsEngine(scene);

  // Adds debug info sprite with fps, number of objects, etc
  if (Config.debug && Config.renderDebugData) {
    scene.addSprite(DebugInfoSprite(scene), { sceneLayer: SceneLayer.Shell });
  }

  return scene;

  function updateLoop(dt: number) {
    // TODO: not create an array every time you want
    // to traverse the sprites. What about using generators...?
    Array.from(this.sprites).forEach((s: Sprite) => s.update());

    this.collisionEngine.processCollisions(dt);

    // Logs information about game objects in-game
    if (Config.debug && Config.verbose) {
      this.logGameObjects();
    }

    // TODO: this should be handled by pools :D
    this.sprites.foreground = this.sprites.foreground.filter((sprite: Sprite) =>
      sprite.isAlive()
    );
    this.sprites.shell = this.sprites.shell.filter((sprite: Sprite) =>
      sprite.isAlive()
    );
  }

  function renderLoop() {
    // TODO: use generators so I don't need to create a new array
    // each time
    // background never out of bounds
    Array.from(this.sprites).forEach((s: Sprite) => s.render());
  }
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
    lastframe: performance.now(),
    fps: 0,
    dt: 0,
    ttl: Infinity,
    update() {
      // calculate every frame but only show every half a second
      this.dt += 1 / 60;
      let thisframe = performance.now();
      if (this.dt > 0.5) {
        this.dt = 0;
        this.fps = 1000 / (thisframe - this.lastframe);
      }
      this.lastframe = thisframe;
    },
    render() {
      this.context.save();
      this.context.font = "normal normal 12px monospace";
      this.context.fillStyle = "white";
      let textToRender = `
fps: ${this.fps.toFixed(0)}
camera : (${scene.cameraPosition.x.toFixed(
        0
      )}, ${scene.cameraPosition.y.toFixed(0)})
${getSpriteCount(Array.from(scene.sprites.allSprites()))}
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

export function showMessageWhenAvailable() {
  // returns a function that
  // takes an item from a message queue and shows it
  return doThisEvery({
    condition() {
      return this.messageQueue.length > 0;
    },
    action(this: Scene) {
      let message = this.messageQueue.shift();
      let text = createGameStatusText(message.text, message.type);
      this.addSprite(text, { sceneLayer: SceneLayer.Shell });
    },
    t: 2
  });
}
