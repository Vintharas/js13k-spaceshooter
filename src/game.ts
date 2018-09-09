import createSpaceScene from "./scenes/spaceScene";
import { Scene } from "./scenes/scene";
import createOpenScene from "./scenes/openScene";
import createGameOverScene from "./scenes/gameOverScene";
import { createChooseFactionScene } from "./scenes/factionScene";
import { Faction } from "./factions";
import { GameData } from "./data/gamedata";
import OffscreenCanvas from "./canvas";
import { PlanetType, PlanetBaseColors, PlanetTypes } from "./planet";
import Config from "./config";
import { HSL } from "./utils";
import { ElderColors } from "./enemies/elder";
import { createGameStatusText } from "./text";

export default class Game {
  private static game: Game;
  public currentScene: Scene;
  public gameData: GameData;

  private constructor() {
    this.currentScene = createOpenScene();
    this.preloadTextures();
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

  preloadTextures() {
    if (Config.debug && Config.verbose)
      console.log("preloading planet textures");
    // preloads textures for planets
    // to ensure 60fps when the game starts playing
    PlanetTypes.forEach(p =>
      this.preloadPlanetTexture(p, Config.Textures.Planet)
    );
    this.preloadPlanetTexture(PlanetType.Sun, Config.Textures.Sun);
    this.preloadElderTexture(ElderColors.granate);
    this.preloadElderTexture(ElderColors.green);
  }

  preloadPlanetTexture(type: PlanetType, size: number) {
    let color = PlanetBaseColors[type];
    OffscreenCanvas.instance().getPatternBasedOnColor(
      color.h,
      color.s,
      color.s,
      size
    );
  }
  preloadElderTexture(accent: HSL) {
    OffscreenCanvas.instance().getPatternBasedOnColors(
      ElderColors.grey,
      accent,
      Config.Textures.Elder,
      Config.Textures.Elder
    );
  }
}
