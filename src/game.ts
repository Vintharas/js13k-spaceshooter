import createSpaceScene from "./scenes/spaceScene";
import { Scene } from "./scenes/scene";
import createOpenScene from "./scenes/openScene";
import createGameOverScene from "./scenes/gameOverScene";
import { Faction } from "./factions";
import { GameData } from "./data/gamedata";
import OffscreenCanvas from "./canvas";
import { PlanetType, PlanetBaseColors, PlanetTypes } from "./planet";
import { HSL } from "./utils";
import { ElderColors } from "./enemies/elder";
import { GameMusic, Track } from "./music/music";
import { GameStory } from "./story";

function GameAssets(): Assets {
  let images: any = {};

  return {
    images,
    load(...imagesUrls: string[]) {
      imagesUrls.forEach(url => {
        let image = new Image();
        image.src = url;

        image.onload = function loadImageOnLoad() {
          images[getName(url)] = images[url] = this;
        };
      });
    }
  };

  function getName(url: string): string {
    return url.split(".")[0].toLowerCase();
  }
}

export default class Game {
  private static game: Game;
  public currentScene: Scene;
  public gameData: GameData;
  public assets: Assets = GameAssets();
  public story: GameStory = GameStory();

  private gameMusic = GameMusic();

  private constructor() {
    this.gameMusic.play(Track.Opening);
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

  goToSpaceScene(selectedFaction: Faction = Faction.Blue): void {
    // can have more music in other parts of the game
    this.gameData = GameData(selectedFaction);
    this.switchToScene(createSpaceScene(this.gameData));
    this.gameMusic.play(Track.Space);
  }

  goToGameOverScene({ win = false } = {}): any {
    this.switchToScene(createGameOverScene({ win }));
    this.gameData = null;
  }

  /*
  goToChooseFaction(): any {
    this.switchToScene(createChooseFactionScene());
  }
  */

  goToOpenScene(): any {
    // TODO: cache scene
    this.switchToScene(createOpenScene());
  }

  switchToScene(scene: Scene) {
    this.gameMusic.stop();
    this.currentScene.stop();
    this.currentScene = scene;
    this.start();
  }

  preloadTextures() {
    /*
    if (Config.debug && Config.verbose)
      console.log("preloading planet textures");
      */
    // preloads textures for planets
    // to ensure 60fps when the game starts playing
    PlanetTypes.forEach(p => this.preloadPlanetTexture(p, 100));
    this.preloadPlanetTexture(PlanetType.Sun, 100);
    this.preloadElderTexture(ElderColors.granate);
    this.preloadElderTexture(ElderColors.green);
    // preload asteroid texture
    let color = { h: 37, s: 55, l: 57 };
    OffscreenCanvas.instance().getPatternBasedOnColors(color, {
      h: color.h,
      s: color.s,
      l: color.l + 10
    });
  }

  preloadPlanetTexture(type: PlanetType, size: number) {
    let color = PlanetBaseColors[type];
    OffscreenCanvas.instance().getPatternBasedOnColors(
      color,
      { h: color.h, s: color.s, l: color.l + 10 },
      size,
      size,
      3
    );
  }
  preloadElderTexture(accent: HSL) {
    OffscreenCanvas.instance().getPatternBasedOnColors(
      ElderColors.grey,
      accent,
      20,
      20
    );
  }
}
