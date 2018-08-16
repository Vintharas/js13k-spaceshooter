// manages sprites and game loop within
// a single scene
export default class Scene {
  constructor(public sprites: any[], private loop: any) {}

  addSprite(sprite: any) {
    this.sprites.push(sprite);
  }
  start() {
    this.loop.start();
  }
  stop() {
    this.loop.stop();
  }
}
