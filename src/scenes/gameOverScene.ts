import Scene from "./scene";
import { createText } from "../text";
import Game from "../game";

export default function createGameOverScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);

  // TODO: we may be able to extract this into some common
  // text based scene
  const titleText = createText("GAME OVER", { x: 100, y: 250 }, undefined, {
    size: 48
  });
  scene.addSprite(titleText);

  const startText = createText("Press ENTER to play again", { x: 200, y: 300 });
  scene.addSprite(startText);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter")) {
      Game.instance().goToOpenScene();
    }
  }

  //TODO: This logic can be common to all scenes
  function render() {
    scene.sprites.forEach(s => s.render());
  }
}
