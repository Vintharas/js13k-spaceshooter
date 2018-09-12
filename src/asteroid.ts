import {
  Position,
  getCanvasPosition,
  isObjectOutOfRenderBounds,
  Velocity,
  getValueInRange,
  degreesToRadians,
  Color
} from "./utils";
import OffscreenCanvas from "./canvas";
import Config from "./config";

export interface Asteroid extends Sprite {
  radius: number;
  ttl: number;
  dt: number;
}

interface AsteroidSide {
  length: number;
  angle: number;
}

export function createAsteroid(
  position: Position,
  velocity: Velocity,
  radius: number,
  cameraPosition: Position
): Asteroid {
  let asteroid = kontra.sprite({
    type: SpriteType.Asteroid,
    x: position.x,
    y: position.y,
    radius,
    sides: [],
    ttl: Infinity,
    dx: velocity.dx,
    dy: velocity.dy,
    dt: 0,
    render() {
      if (isObjectOutOfRenderBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      this.context.save();
      this.context.translate(position.x + this.radius, position.y);
      this.context.rotate(Math.PI / 2);

      // Drawing asteroids as a polygon
      let angle = () => getValueInRange(30, 70);
      let length = () => this.radius * (1 + getValueInRange(-0.2, 0.2));

      this.context.beginPath(); // start drawing a shape
      this.context.moveTo(0, 0); // since I translated to the position of the asteroid
      for (let i = 0; i < 4; i++) {
        if (!this.sides[i]) {
          this.sides[i] = { length: length(), angle: angle() };
        }
        let sideLength = this.sides[i].length;
        let sideAngle = this.sides[i].angle;

        let x = Math.cos(degreesToRadians(sideAngle)) * sideLength;
        let y = Math.sin(degreesToRadians(sideAngle)) * sideLength;
        this.context.lineTo(x, y);
        this.context.strokeStyle = Color.hsla(37, 55, 57);
        this.context.stroke();
        this.context.translate(x, y);
        this.context.rotate(degreesToRadians(sideAngle));
      }

      // this is a brownish color
      // could have different colors for different clusters of asteroids
      this.context.fillStyle = OffscreenCanvas.instance().getPatternBasedOnColor(
        37,
        55,
        57
      );
      this.context.fill(); // fill circle
      this.context.restore();

      /*
      // Drawing asteroids as a circle
      // this is what we use for collision
      // useful for debugging
      if (Config.debug && Config.renderCollisionArea) {
        this.context.save();
        this.context.strokeStyle = "red";
        this.context.beginPath(); // start drawing a shape
        this.context.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
        this.context.stroke(); // outline the circle
        this.context.restore();
      }
      */
    }
  });

  return asteroid;
}
