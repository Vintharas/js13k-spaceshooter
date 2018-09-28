import {
  Position,
  Velocity,
  getValueInRange,
  getCanvasPosition,
  Color,
  degreesToRadians
} from "../utils";
import { StaticParticlePool } from "./StaticParticlePool";
import { ParticleType, ParticleOptions, Particle } from "./Particle";
import { ParticlePool } from "./ParticlePool";

export class ParticlePools {
  private static particlePools = new ParticlePools();
  private staticParticlePool = StaticParticlePool();
  private particlePool = ParticlePool();

  public get pools(): Pool[] {
    return [this.staticParticlePool, this.particlePool];
  }
  public static instance(): ParticlePools {
    return this.particlePools;
  }

  private constructor() {}

  public get(type: ParticleType, props: any): void {
    if (type === ParticleType.StaticParticle) {
      return this.staticParticlePool.get(props);
    } else if (type === ParticleType.Particle) {
      return this.particlePool.get(props);
    } else {
      // TODO
    }
  }
}

// particle that takes into account camera position
// and goes in every direction
export function ExplosionParticle(
  position: Position,
  cameraPosition: Position,
  {
    ttl = 30,
    color = { r: 255, g: 255, b: 255 },
    magnitude = 5
  }: ParticleOptions = {}
): any {
  let angle = getValueInRange(0, 360);
  magnitude = getValueInRange(0, magnitude);
  let dx = Math.cos(degreesToRadians(angle)) * magnitude;
  let dy = Math.sin(degreesToRadians(angle)) * magnitude;

  return kontra.sprite({
    type: SpriteType.Particle,
    x: position.x,
    y: position.y,
    dx,
    dy,

    // each particle with have a slightly
    // different lifespan
    ttl: getValueInRange(0, ttl),
    dt: 0,

    width: 2,
    height: 2,
    color,

    update() {
      this.dt += 1 / 60;
      this.advance();
    },
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      // as time passes the alpha increases until particles disappear
      let frames = this.dt * 60;
      let alpha = 1 - frames / ttl;
      this.context.fillStyle = Color.rgba(
        this.color.r,
        this.color.g,
        this.color.b,
        alpha
      );
      this.context.fillRect(position.x, position.y, this.width, this.height);
    }
  });
}
