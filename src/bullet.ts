import {
  Position,
  getCanvasPosition,
  Velocity,
  degreesToRadians,
  RGB,
  Color
} from "./utils";
import { Scene } from "./scenes/scene";
import { createParticle } from "./particles";
import Config from "./config";
import { Draw } from "./draw";
import { Vector } from "./vector";

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
  damage: number = 10,
  color: RGB = { r: 255, g: 255, b: 255 }
): Bullet {
  let cos = Math.cos(degreesToRadians(angle));
  let sin = Math.sin(degreesToRadians(angle));

  return kontra.sprite({
    type: SpriteType.Bullet,
    // start the bullet on the ship at the end of the triangle
    x: position.x + cos * 12,
    y: position.y + sin * 12,
    // move the bullet slightly faster than the ship
    // it can happen that the ship is going in the opposite direction
    // than the bullets (in that case the speed of the bullets is smaller with
    // the current implementation)
    dx: velocity.dx + cos * 5,
    dy: velocity.dy + sin * 5,
    // damage can vary based on who shoots the missile
    damage,
    owner,
    // live only 50 frames
    // TODO: This should be configurable as range of firing
    ttl: 50,
    // bullets are small
    width: 2,
    height: 2,
    color,
    update() {
      this.followNearTarget();
      this.advance();
      for (let i = 0; i <= Config.Bullets.NumberOfParticles; i++) {
        let particle = createParticle(
          { x: this.x, y: this.y },
          { dx: this.dx, dy: this.dy },
          cameraPosition,
          angle,
          { color }
        );
        scene.addSprite(particle);
      }
    },
    followNearTarget() {
      // HERE
    },
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      this.context.fillStyle = Color.rgb(this.color);
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
