import "kontra";
import createSpaceScene from "./spaceScene";
import Scene from "./scene";
import createOpenScene from "./openScene";

export default class Game {
  private static game: Game;
  public currentScene: Scene;

  private constructor() {
    kontra.init();
    this.currentScene = createOpenScene();
  }

  static instance(): Game {
    if (this.game == undefined) this.game = new Game();
    return this.game;
  }

  start() {
    this.currentScene.start();
  }

  goToSpaceScene(): void {
    this.currentScene.stop();
    this.currentScene = createSpaceScene();
    this.start();
  }
}
