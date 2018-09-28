import {
  getValueInRange,
  getCanvasPosition,
  Color,
  degreesToRadians
} from "../utils";
import { Particle, ParticleOptions } from "./Particle";

export interface ParticlePool extends Pool {}
export function ParticlePool(): ParticlePool {
  return kontra.pool({
    maxSize: 150,
    create() {
      return kontra.sprite({
        type: SpriteType.Particle,
        width: 2,
        init({
          position,
          velocity,
          cameraPosition,
          angle,
          particleOptions: { ttl = 30, color = { r: 255, g: 255, b: 255 } }
        }: {
          position: Position;
          velocity: Velocity;
          cameraPosition: Position;
          angle: number;
          particleOptions: ParticleOptions;
        }) {
          let angleVariance = getValueInRange(-5, 5);
          let cos = Math.cos(degreesToRadians(angle + angleVariance));
          let sin = Math.sin(degreesToRadians(angle + angleVariance));

          Object.assign(this, {
            ...position,
            cameraPosition,
            dx: velocity.dx - cos * 4,
            dy: velocity.dy - sin * 4,
            ttl: getValueInRange(20, ttl),
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
          let size = (1 + (0.5 * frames) / this.maxTTL) * this.width;

          if (!this.context) return;

          this.context.fillStyle = Color.rgba(
            this.color.r,
            this.color.g,
            this.color.b,
            alpha
          );
          this.context.fillRect(position.x, position.y, size, size);
        }
      });
    }
  });
}

// particle that takes into account camera position
export function Particle(
  position: Position,
  velocity: Velocity,
  cameraPosition: Position,
  angle: number,
  { ttl = 30, color = { r: 255, g: 255, b: 255 } }: ParticleOptions = {}
): Particle {
  let angleVariance = getValueInRange(-5, 5);

  let cos = Math.cos(degreesToRadians(angle + angleVariance));
  let sin = Math.sin(degreesToRadians(angle + angleVariance));

  let x = position.x;
  let y = position.y;
  let dx = velocity.dx - cos * 4;
  let dy = velocity.dy - sin * 4;

  let maxTTL = ttl;
  ttl = getValueInRange(20, maxTTL);

  return kontra.sprite({
    type: SpriteType.Particle,

    // particles originate from a single point
    x,
    y,
    cameraPosition,

    // variance so that different particles will have
    // slightly different trajectories
    dx,
    dy,

    // each particle with have a slightly
    // different lifespan
    ttl,
    dt: 0,

    color,

    // particles are small
    width: 2,
    update() {
      this.dt += 1 / 60;
      this.advance();
    },
    render() {
      let position = getCanvasPosition(this, this.cameraPosition);
      // as time passes the alpha increases until particles disappear
      let frames = this.dt * 60;
      let alpha = 1 - frames / ttl;
      let size = (1 + (0.5 * frames) / ttl) * this.width;
      this.context.fillStyle = Color.rgba(
        this.color.r,
        this.color.g,
        this.color.b,
        alpha
      );
      this.context.fillRect(position.x, position.y, size, size);
    }
  });
}
