import { Position, Positions, Sprite } from "../utils";
import Config from "../config";
import CollisionsEngine from "../collisions";

export default interface Scene {
  sprites: Sprite[];
  update(dt: number): void;
  addSprite(sprite: Sprite): void;
  start(): void;
  stop(): void;
}

// TODO: migrate from scene class to
// scene factory. I think that the factory
// will work better in tandem with kontra.js
export function createScene(
  update: ((dt: number) => void) = () => {},
  render: (() => void) = () => {}
): Scene {
  let sprites: Sprite[] = [];
  let loop = kontra.gameLoop({
    update(dt: number) {
      update(dt);
      sprites.forEach(s => s.update(dt));
    },
    render() {
      render();
      sprites.forEach(s => s.render());
    }
  });

  return {
    ...loop,
    ...{
      sprites,
      // TODO: this may not be necessary
      // consider removing to save space
      addSprite(sprite: Sprite) {
        this.sprites.push(sprite);
      }
    }
  };
}

// manages sprites and game loop within
// a single scene
export default class Scene {
  private collisionsEngine: CollisionsEngine;
  // TODO: this should be part of the constructor
  public cameraPosition: Position;

  constructor(public sprites: Sprite[], private loop: any) {
    this.collisionsEngine = new CollisionsEngine(this);
    if (Config.debug && Config.verbose) {
      this.logGameObjects(loop);
    }
  }

  addSprite(sprite: any) {
    this.sprites.push(sprite);
  }
  start() {
    this.loop.start();
  }
  stop() {
    this.loop.stop();
  }

  logGameObjects(loop: any) {
    let dt = 0;
    const sprites = () => this.sprites;
    const cameraPosition = () => this.cameraPosition;
    let update = this.loop.update;
    let logPeriodSeconds = 1;

    this.loop.update = function debugUpdate(...args: any[]) {
      dt += 1 / 60;
      if (dt >= logPeriodSeconds) {
        dt = 0;
        console.table(
          sprites()
            .filter((s: any) => {
              let isLogged = Config.typesToLog.includes(s.type);
              if (Config.onlyLogInProximityToShip)
                isLogged =
                  isLogged && Positions.areNear(s, cameraPosition(), 50);
              return isLogged;
            })
            .map(Config.logTheseProperties)
        );
      }
      // call real loop update function
      update.apply(this, args);
    };
  }

  processCollisions(dt: number): void {
    this.collisionsEngine.processCollisions(dt);
  }
}
