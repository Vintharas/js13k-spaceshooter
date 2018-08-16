import "kontra";
import createSpaceScene from "./spaceScene";
import Scene from "./scene";

export default class Game {
  public currentScene: Scene;

  constructor() {
    kontra.init();
    this.currentScene = createSpaceScene();
  }

  start() {
    this.currentScene.start();
  }
}
