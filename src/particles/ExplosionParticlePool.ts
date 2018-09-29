import { ParticleOptions } from "./Particle";
import {
  Position,
  getValueInRange,
  degreesToRadians,
  getCanvasPosition,
  Color
} from "../utils";

export interface ExplosionParticlePool extends Pool {}
export function ExplosionParticlePool(): ExplosionParticlePool {
  return kontra.pool({
    maxSize: 300,
    create() {
      return kontra.sprite({
        type: SpriteType.Particle,
        width: 2,
        height: 2,
        init({
          position,
          cameraPosition,
          particleOptions: {
            ttl = 30,
            color = { r: 255, g: 255, b: 255 },
            magnitude = 5
          }
        }: {
          position: Position;
          cameraPosition: Position;
          particleOptions: ParticleOptions;
        }) {
          let angle = getValueInRange(0, 360);
          magnitude = getValueInRange(0, magnitude);
          let dx = Math.cos(degreesToRadians(angle)) * magnitude;
          let dy = Math.sin(degreesToRadians(angle)) * magnitude;
          Object.assign(this, {
            x: position.x,
            y: position.y,
            cameraPosition,
            dx,
            dy,
            ttl: getValueInRange(10, ttl),
            maxTTL: ttl,
            color,
            dt: 0
          });
        },
        update() {
          this.dt += 1 / 60;
          this.advance();
        },
        render() {
          let position = getCanvasPosition(this, this.cameraPosition);
          // as time passes the alpha increases until particles disappear
          let frames = this.dt * 60;
          let alpha = 1 - frames / this.maxTTL;

          if (!this.context) return;

          this.context.fillStyle = Color.rgba(
            this.color.r,
            this.color.g,
            this.color.b,
            alpha
          );
          this.context.fillRect(
            position.x,
            position.y,
            this.width,
            this.height
          );
        }
      });
    }
  });
}
