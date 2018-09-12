import { createScene } from "./scene";
import { createText } from "../text";
import Game from "../game";

export default function createGameOverScene({ win = false } = {}) {
  let scene = createScene({ update });

  let text = win ? "VICTORY!!!!" : "GAME OVER";
  let titleText = createText(text, { x: undefined, y: 250 }, undefined, {
    size: 48
  });
  scene.addSprite(titleText);

  let startText = createText("Press ENTER to play again", {
    x: undefined,
    y: 300
  });
  scene.addSprite(startText);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter")) {
      Game.instance().goToOpenScene();
    }
  }
}
