import Scene from "./scene";
import { createText } from "../text";
import Game from "../game";
import Config from "../config";
import { Faction, FactionConfig } from "../factions";
import { Sprite } from "../utils";

export function createChooseFactionScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);

  const titleText = createText(
    "CHOOSE YOUR FACTION",
    { x: undefined, y: 100 },
    {},
    { size: 48 }
  );
  scene.addSprite(titleText);

  const factionSelector = createFactionSelector();
  scene.addSprite(factionSelector);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter") && factionSelector.selectedFaction()) {
      Game.instance().goToSpaceScene(factionSelector.selectedFaction());
    }
    scene.sprites.forEach(s => s.update());
  }

  //TODO: This logic can be common to all scenes
  function render() {
    scene.sprites.forEach(s => s.render());
  }
}

interface FactionSelector extends Sprite {
  selectedFaction(): Faction;
}

function createFactionSelector(): FactionSelector {
  return kontra.sprite({
    dt: 0,
    selectedFaction() {
      if (this.selectedIndex !== undefined)
        return this.factions[this.selectedIndex];
    },
    selectedIndex: undefined,
    factions: [Faction.Blue, Faction.Green, Faction.Red],
    update() {
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
    },
    render() {
      this.factions.forEach((faction: Faction, index: number) =>
        this.renderFaction(faction, index)
      );
    },
    renderFaction(faction: Faction, index: number) {
      let factionConfig = Config.Factions[faction];
      let factionWidth = Config.canvasWidth / 4;
      let outerMargin = factionWidth / 2;
      let innerMargin = 50;

      this.context.font = "normal normal 24px monospace";
      this.context.fillText(
        factionConfig.Name.toUpperCase(),
        index * factionWidth + outerMargin + innerMargin,
        200
      );
      // planet
      this.context.font = "normal normal 12px monospace";
      this.context.fillText(
        factionConfig.Description.toUpperCase(),
        index * factionWidth + outerMargin + innerMargin,
        400
      );

      if (faction === this.selectedFaction()) {
        console.log("render selected faction: ", faction);
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
