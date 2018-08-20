import Scene from "./scene";
import createText from "./text";
import Game from "./game";

export default function createGameOverScene() {
  let loop = kontra.gameLoop({
    update,
    render
  });
  const scene = new Scene([], loop);

  // TODO: we may be able to extract this into some common
  // text based scene
  const titleText = createText("GAME OVER", 100, 250, "48px serif");
  scene.addSprite(titleText);

  const startText = createText("Press ENTER to play again", 200, 300);
  scene.addSprite(startText);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter")) {
      Game.instance().goToSpaceScene();
    }
  }

  //TODO: This logic can be common to all scenes
  function render() {
    scene.sprites.forEach(s => s.render());
  }
}
