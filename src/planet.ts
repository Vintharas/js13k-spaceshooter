import {
  Position,
  getCanvasPosition,
  isObjectOutOfBounds,
  Sprite,
  degreesToRadians
} from "./utils";
import OffscreenCanvas from "./canvas";
import Config from "./config";

export interface Planet extends Sprite {
  radius: number;
  outerRadius: number;
  dt: number;
}

export function createPlanet(
  position: Position,
  radius: number,
  cameraPosition: Position
): Planet {
  let asteroid = kontra.sprite({
    type: "planet",
    x: position.x,
    y: position.y,
    radius,
    outerRadius: radius + 0.25 * radius,
    ttl: Infinity,
    dt: 0,
    rotation: 0,
    update() {
      this.rotation += 1 / 4;
    },
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      // #1. Actual planet and texture
      this.context.save();
      this.context.translate(position.x, position.y);
      this.context.rotate(degreesToRadians(this.rotation));
      this.context.fillStyle = OffscreenCanvas.instance().getPatternBasedOnColor(
        120,
        100,
        39
      );
      this.context.strokeStyle = "red";
      this.context.beginPath(); // start drawing a shape
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.fill(); // outline the circle

      // #2. gradient to give it a 3d look
      this.context.beginPath(); // start drawing a shape
      let gradient = this.context.createRadialGradient(
        0,
        0,
        (3 * this.radius) / 4,
        0,
        0,
        this.radius
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.7)");
      this.context.fillStyle = gradient;
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.fill();

      // #3. radius where you can start collecting stuff
      this.context.beginPath(); // start drawing a shape
      this.context.strokeStyle = "turquoise";
      this.context.setLineDash([5, 15]);
      this.context.arc(0, 0, this.outerRadius, 0, Math.PI * 2);
      this.context.stroke();

      this.context.restore();

      // Drawing asteroids as a circle
      // this is what we use for collision
      // useful for debugging
      if (Config.debug && Config.renderCollisionArea) {
      }
    }
  });

  return asteroid;
}
