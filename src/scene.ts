import { Position } from "./utils";
import Config from "./config";

// manages sprites and game loop within
// a single scene
export default class Scene {
  constructor(
    public sprites: any[],
    private loop: any,
    public cameraPosition: Position = { x: 1500, y: 1500 }
  ) {
    if (Config.debug) {
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

  updateCameraPosition(position: Position) {
    this.cameraPosition.x = position.x;
    this.cameraPosition.y = position.y;
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
          sprites().map((s: any) => ({
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
}
