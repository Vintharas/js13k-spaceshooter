/*
import { Position } from "../utils";
import { Scene, createScene } from "./scene";
import { createText } from "../text";
import Game from "../game";
import Config from "../config";
import { Faction } from "../factions";
import { createPlanet } from "../planet";

export function createChooseFactionScene() {
  let scene = createScene({ update });

  let titleText = createText(
    "CHOOSE YOUR FACTION",
    { x: undefined, y: 100 },
    {},
    { size: 48 }
  );
  scene.addSprite(titleText);

  let factionSelector = createFactionSelector(scene);
  scene.addSprite(factionSelector);

  return scene;

  function update(dt: number) {
    if (kontra.keys.pressed("enter") && factionSelector.selectedFaction()) {
      Game.instance().goToSpaceScene(factionSelector.selectedFaction());
    }
  }
}

interface FactionSelector extends Sprite {
  selectedFaction(): Faction;
}

function createFactionSelector(scene: Scene): FactionSelector {
  let factionWidth = Config.canvasWidth / 4;
  let outerMargin = factionWidth / 2;

  return kontra.sprite({
    dt: 0,
    ttl: Infinity,
    selectedFaction() {
      if (this.selectedIndex !== undefined)
        return this.factions[this.selectedIndex];
    },
    selectedIndex: undefined,
    factions: [Faction.Blue, Faction.Green, Faction.Red],
    planets: [],
    emblems: [],
    update(dt: number) {
      this.dt += 1 / 60;

      // this delay is necessary so that the first time the user
      // types enter it won't jump over the faction selection
      // screen immediatelly
      if (this.dt > 0.5 && this.selectedIndex === undefined) {
        this.dt = 0;
        this.selectedIndex = 0;
      }

      if (this.dt > 0.5 && kontra.keys.pressed("left")) {
        this.dt = 0;
        this.selectedIndex--;
        if (this.selectedIndex < 0)
          this.selectedIndex = this.factions.length - 1;
      } else if (this.dt > 0.5 && kontra.keys.pressed("right")) {
        this.dt = 0;
        this.selectedIndex++;
        if (this.selectedIndex >= this.factions.length) this.selectedIndex = 0;
      }

      this.planets.forEach((s: Sprite) => s.update(dt));
    },
    render() {
      this.factions.forEach((faction: Faction, index: number) =>
        this.renderFaction(faction, index)
      );
    },
    renderFaction(faction: Faction, index: number) {
      let factionConfig = Config.Factions[faction];

      this.context.font = "normal normal 24px monospace";
      this.context.fillText(
        factionConfig.Name.toUpperCase(),
        index * factionWidth +
          outerMargin +
          (factionWidth / 2 - (factionConfig.Name.length / 2) * 0.63 * 24),
        200
      );

      // planet
      if (!this.planets[index]) {
        // create planet
        let radius = 50;
        let sunPosition: Position = {
          x: index * factionWidth + outerMargin + factionWidth / 2,
          y: 300
        };
        this.planets[index] = createPlanet(
          sunPosition, // origin
          0, // orbit
          radius,
          { x: Config.canvasWidth / 2, y: Config.canvasHeight / 2 },
          scene,
          { drawOuterRadius: false },
          factionConfig.Planet,
          factionConfig.PlanetName
        );
      }
      this.planets[index].render();

      // emblems
      // if (!this.emblems[index]) {
      //   this.emblems[index] = kontra.sprite({
      //     image: kontra.assets.images.blueemblem,
      //     x: index * factionWidth + outerMargin + factionWidth / 2,
      //     y: 300,
      //     render() {
      //       let context: CanvasRenderingContext2D = this.context;
      //       context.drawImage(this.image, this.x, this.y, 128, 128);
      //     }
      //   });
      // }
      // this.emblems[index].render();

      // description
      this.context.font = "normal normal 12px monospace";
      this.context.fillText(
        factionConfig.Objective.toUpperCase(),
        index * factionWidth +
          outerMargin +
          factionWidth / 2 -
          (factionConfig.Objective.length / 2) * 12 * 0.63,
        400
      );

      // selected rectangle
      if (faction === this.selectedFaction()) {
        this.context.strokeStyle = "white";
        this.context.strokeRect(
          index * factionWidth + outerMargin,
          150,
          factionWidth,
          300
        );
      }
    }
  });
}
*/
