import {
  Position,
  Velocity,
  getValueInRange,
  getCanvasPosition,
  Color,
  degreesToRadians,
  RGB
} from "./utils";

export interface Particle extends Sprite {}

export interface ParticleOptions {
  ttl?: number;
  color?: RGB;
  magnitude?: number;
}

export enum ParticleType {
  StaticParticle,
  Particle,
  ExplosionParticle
}

export class ParticlePools {
  private static particlePools = new ParticlePools();
  private staticParticlePool = StaticParticlePool();
  public get pools(): Pool[] {
    return [this.staticParticlePool];
  }
  public static instance(): ParticlePools {
    return this.particlePools;
  }

  private constructor() {}

  public get(type: ParticleType, props: any): void {
    if (type === ParticleType.StaticParticle) {
      return this.staticParticlePool.get(props);
    } else if (type === ParticleType.Particle) {
      // TODO
    } else {
      // TODO
    }
  }
}

export interface StaticParticlePool extends Pool {}
export function StaticParticlePool(): StaticParticlePool {
  return kontra.pool({
    maxSize: 150,
    create() {
      return kontra.sprite({
        type: SpriteType.Particle,
        // particles originate from the same point
        // the always originate from the back of the ship
        // which is in the center of the screen
        x: 0,
        y: 0,
        particleAxis: 0,
        // variance so that different particles will have
        // slightly different trajectories
        dx: 0,
        dy: 0,

        maxTTL: 70,
        dt: 0,

        // particles are small
        width: 2,

        // So that the particles don't originate from
        // a single point
        thicknessVariance: 0,
        offset: { x: 0, y: 0 },
        update() {
          this.dt += 1 / 60;
          this.advance();
        },
        render() {
          // as time passes the alpha increases until particles disappear
          let frames = this.dt * 60;
          let alpha = 1 - frames / this.maxTTL;
          let size = (1 + (0.5 * frames) / this.maxTTL) * this.width;

          // for some reason the context is null some times???
          // does this happen when a sprite is recycled by the pool?
          if (!this.context) return;

          // easier to paint these by rotating the canvas
          this.context.save();
          this.context.translate(this.x, this.y);
          this.context.rotate(degreesToRadians(this.particleAxis));
          this.context.fillStyle = Color.rgba(255, 255, 255, alpha);
          this.context.fillRect(
            this.offset.x,
            this.offset.y + this.thicknessVariance,
            size,
            size
          );
          this.context.restore();
        },
        init({
          position,
          velocity,
          particleAxis,
          offset = { x: 4, y: 0 }
        }: {
          position: Position;
          velocity: Velocity;
          particleAxis: number;
          offset: Position;
        }) {
          let dxVariance = getValueInRange(0.5, 1.5);
          let dyVariance = getValueInRange(0.5, 1.5);
          let ParticleAxisVariance = getValueInRange(-20, 20);
          let maxTTL = 70;

          let cos = Math.cos(
            degreesToRadians(particleAxis + ParticleAxisVariance)
          );
          let sin = Math.sin(
            degreesToRadians(particleAxis + ParticleAxisVariance)
          );

          let dx = velocity.dx * cos * dxVariance;
          let dy = velocity.dy * sin * dyVariance;

          let ttl = getValueInRange(10, maxTTL);

          let thicknessVariance = getValueInRange(-4, 4);

          Object.assign(this, {
            ...position,
            offset,
            particleAxis,
            dx,
            dy,
            ttl,
            thicknessVariance,
            dt: 0
          });
        }
      });
    }
  });
}

// particles that don't take into account cameraPosition
// TODO: refactor these two so they use common code
// right now it is quite specific to the ships exhaust when moving the ship
export function StaticParticle(
  position: Position,
  velocity: Velocity,
  particleAxis: number,
  offset: Position = { x: 4, y: 0 }
): Particle {
  let dxVariance = getValueInRange(0.5, 1.5);
  let dyVariance = getValueInRange(0.5, 1.5);
  let ParticleAxisVariance = getValueInRange(-20, 20);
  let maxTTL = 70;

  let cos = Math.cos(degreesToRadians(particleAxis + ParticleAxisVariance));
  let sin = Math.sin(degreesToRadians(particleAxis + ParticleAxisVariance));

  return kontra.sprite({
    type: SpriteType.Particle,

    // particles originate from the same point
    // the always originate from the back of the ship
    // which is in the center of the screen
    x: position.x,
    y: position.y,
    particleAxis,

    // variance so that different particles will have
    // slightly different trajectories
    dx: velocity.dx * cos * dxVariance,
    dy: velocity.dy * sin * dyVariance,

    // each particle with have a slightly
    // different lifespan
    ttl: getValueInRange(10, maxTTL),
    dt: 0,

    // particles are small
    width: 2,

    // So that the particles don't originate from
    // a single point
    thicknessVariance: getValueInRange(-4, 4),
    update() {
      this.dt += 1 / 60;
      this.advance();
    },
    render() {
      // as time passes the alpha increases until particles disappear
      let frames = this.dt * 60;
      let alpha = 1 - frames / maxTTL;
      let size = (1 + (0.5 * frames) / maxTTL) * this.width;

      // easier to paint these by rotating the canvas
      this.context.save();
      this.context.translate(this.x, this.y);
      this.context.rotate(degreesToRadians(this.particleAxis));
      this.context.fillStyle = Color.rgba(255, 255, 255, alpha);
      this.context.fillRect(
        offset.x,
        offset.y + this.thicknessVariance,
        size,
        size
      );
      this.context.restore();
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

  return kontra.sprite({
    type: SpriteType.Particle,

    // particles originate from a single point
    x: position.x,
    y: position.y,

    // variance so that different particles will have
    // slightly different trajectories
    dx: velocity.dx - cos * 4,
    dy: velocity.dy - sin * 4,

    // each particle with have a slightly
    // different lifespan
    ttl: getValueInRange(20, ttl),
    dt: 0,

    // particles are small
    width: 2,
    update() {
      this.dt += 1 / 60;
      this.advance();
    },
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      // as time passes the alpha increases until particles disappear
      let frames = this.dt * 60;
      let alpha = 1 - frames / ttl;
      let size = (1 + (0.5 * frames) / ttl) * this.width;
      this.context.fillStyle = Color.rgba(color.r, color.g, color.b, alpha);
      this.context.fillRect(position.x, position.y, size, size);
    }
  });
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
