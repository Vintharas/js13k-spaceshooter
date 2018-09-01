import createSpaceScene from "./scenes/spaceScene";
import { Scene } from "./scenes/scene";
import createOpenScene from "./scenes/openScene";
import createGameOverScene from "./scenes/gameOverScene";
import { createChooseFactionScene } from "./scenes/factionScene";
import { Faction } from "./factions";
import { GameData } from "./gamedata";

export default class Game {
  private static game: Game;
  public currentScene: Scene;
  public gameData: GameData;

  private constructor() {
    this.currentScene = createOpenScene();
  }

  static instance(): Game {
    if (this.game == undefined) this.game = new Game();
    return this.game;
  }

  start() {
    this.currentScene.start();
  }

  goToSpaceScene(selectedFaction: Faction): void {
    // TODO: use faction to create game data
    this.gameData = GameData(selectedFaction);
    this.switchToScene(createSpaceScene(this.gameData));
  }

  goToGameOverScene(): any {
    this.switchToScene(createGameOverScene());
    this.gameData = null;
  }

  goToChooseFaction(): any {
    this.switchToScene(createChooseFactionScene());
  }

  goToOpenScene(): any {
    // TODO: cache scene
    this.switchToScene(createOpenScene());
  }

  switchToScene(scene: Scene) {
    this.currentScene.stop();
    this.currentScene = scene;
    this.start();
  }
}
