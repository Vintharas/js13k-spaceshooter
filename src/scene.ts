import { Position } from "./utils";
import Config from "./config";
import CollisionsEngine from "./collisions";

// manages sprites and game loop within
// a single scene
export default class Scene {
  private collisionsEngine: CollisionsEngine;
  // TODO: this should be part of the constructor
  public cameraPosition: Position;

  constructor(public sprites: any[], private loop: any) {
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
    let update = this.loop.update;
    let logPeriodSeconds = 1;

    this.loop.update = function debugUpdate(...args: any[]) {
      dt += 1 / 60;
      if (dt >= logPeriodSeconds) {
        dt = 0;
        console.table(
          sprites()
            .filter((s: any) => Config.typesToLog.includes(s.type))
            .map((s: any) => ({
              type: s.type,
              x: s.x,
              y: s.y
            }))
        );
      }
      // call real loop update function
      update.apply(this, args);
    };
  }

  processCollisions(): void {
    this.collisionsEngine.processCollisions();
  }
}
