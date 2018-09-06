import {
  Position,
  getCanvasPosition,
  Velocity,
  degreesToRadians
} from "./utils";
import { Scene } from "./scenes/scene";
import { createParticle } from "./particles";
import Config from "./config";
import { Draw } from "./draw";

export interface Bullet extends Sprite {
  damage: number;
}

export default function createBullet(
  position: Position,
  velocity: Velocity,
  angle: number,
  cameraPosition: Position,
  scene: Scene,
  owner: Sprite,
  damage: number = 10
): Bullet {
  let cos = Math.cos(degreesToRadians(angle));
  let sin = Math.sin(degreesToRadians(angle));

  return kontra.sprite({
    type: "bullet",
    // start the bullet on the ship at the end of the triangle
    x: position.x + cos * 12,
    y: position.y + sin * 12,
    // move the bullet slightly faster than the ship
    dx: velocity.dx + cos * 5,
    dy: velocity.dy + sin * 5,
    // damage can vary based on who shoots the missile
    damage,
    owner,
    // live only 50 frames
    ttl: 50,
    // bullets are small
    width: 2,
    height: 2,
    color: "white",
    update() {
      this.advance();
      // add particles
      let particle = createParticle(
        { x: this.x, y: this.y },
        { dx: 1, dy: 1 },
        cameraPosition,
        0
      );
      scene.addSprite(particle);
    },
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      this.context.fillStyle = this.color;
      this.context.fillRect(position.x, position.y, this.width, this.height);

      if (Config.debug && Config.showPath) {
        this.context.save();
        this.context.translate(position.x, position.y);
        Draw.drawLine(this.context, 0, 0, this.dx, this.dy, "red");
        this.context.restore();
      }

      if (Config.debug && Config.renderCollisionArea) {
        this.context.save();
        this.context.translate(position.x, position.y);
        Draw.drawCircle(this.context, 0, 0, this.width / 2, "red");
        this.context.restore();
      }
    }
  });
}
