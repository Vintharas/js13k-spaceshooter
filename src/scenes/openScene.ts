import { createScene } from "./scene";
import { createText } from "../text";
import Game from "../game";
import Config from "../config";

export default function createOpenScene() {
  let scene = createScene({ update });

  let titleText = createText(
    "Earth-That-Was",
    { x: undefined, y: 250 },
    {},
    { size: 48 }
  );
  scene.addSprite(titleText);

  let startText = createText("Press ENTER to start", {
    x: undefined,
    y: 300
  });
  scene.addSprite(startText);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter")) {
      //Game.instance().goToChooseFaction();
      Game.instance().goToSpaceScene();
    }
  }
}
