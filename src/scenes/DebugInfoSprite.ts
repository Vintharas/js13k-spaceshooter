import { Scene } from "./scene";
import Config from "../config";

export function DebugInfoSprite(scene: Scene): Sprite {
  return kontra.sprite({
    x: 40,
    y: Config.canvasHeight / 2,
    lastframe: performance.now(),
    fps: 0,
    dt: 0,
    ttl: Infinity,
    update() {
      // calculate every frame but only show every half a second
      this.dt += 1 / 60;
      let thisframe = performance.now();
      if (this.dt > 0.5) {
        this.dt = 0;
        this.fps = 1000 / (thisframe - this.lastframe);
      }
      this.lastframe = thisframe;
    },
    render() {
      this.context.save();
      this.context.font = "normal normal 12px monospace";
      this.context.fillStyle = "white";
      let textToRender = `
fps: ${this.fps.toFixed(0)}
camera : (${scene.cameraPosition.x.toFixed(
        0
      )}, ${scene.cameraPosition.y.toFixed(0)})
${getSpriteCount(Array.from(scene.sprites.allSprites()))}
      `;
      textToRender.split("\n").forEach((text, i) => {
        this.context.fillText(text, this.x, this.y + i * 10, 500);
      });
      this.context.restore();
    }
  });
}

function getSpriteCount(sprites: Sprite[]) {
  let spritesByType = sprites.reduce((map, sprite) => {
    if (!map.has(sprite.type)) map.set(sprite.type, 1);
    else {
      map.set(sprite.type, map.get(sprite.type) + 1);
    }
    return map;
  }, new Map());
  return Array.from(spritesByType.keys()).reduce((str, type) => {
    return str + `${type}: ${spritesByType.get(type)}\n`;
  }, ``);
}
