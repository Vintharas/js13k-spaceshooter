import Scene from "./scene";
import { createText } from "../text";
import Game from "../game";
import Config from "../config";

export default function createOpenScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);

  const titleText = createText(
    "JS13K SPACE SHOOTER",
    { x: undefined, y: 250 },
    {},
    { size: 48 }
  );
  scene.addSprite(titleText);

  const startText = createText("Press ENTER to start", {
    x: undefined,
    y: 300
  });
  scene.addSprite(startText);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter")) {
      Game.instance().goToChooseFaction();
    }
  }

  //TODO: This logic can be common to all scenes
  function render() {
    scene.sprites.forEach(s => s.render());
  }
}
