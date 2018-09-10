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

// particles that don't take into account cameraPosition
// TODO: refactor these two so they use common code
// right now it is quite specific to the ships exhaust when moving the ship
export function createStaticParticle(
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
      this.context.rotate(degreesToRadians(particleAxis));
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
export function createParticle(
  position: Position,
  velocity: Velocity,
  cameraPosition: Position,
  particleAxis: number,
  { ttl = 30, color = { r: 255, g: 255, b: 255 } }: ParticleOptions = {}
): any {
  let ParticleAxisVariance = getValueInRange(-5, 5);

  let cos = Math.cos(degreesToRadians(particleAxis + ParticleAxisVariance));
  let sin = Math.sin(degreesToRadians(particleAxis + ParticleAxisVariance));

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
export function createExplosionParticle(
  position: Position,
  cameraPosition: Position,
  options: ParticleOptions
): any {
  let angle = getValueInRange(0, 360);
  let magnitude = getValueInRange(0, options.magnitude || 5);
  // HERE!!!
  // separate angles from magnitude
  // make random angles from 120 -120 (f.i.)
  // and separate random magnitude of your choice
  // that way the particle explosion will be more predictable
  // that as it is right now!!
  //let dxVariance = getValueInRange(0.5, 3);
  //let dyVariance = getValueInRange(0.5, 3);
  let dx = Math.cos(degreesToRadians(angle)) * magnitude;
  let dy = Math.sin(degreesToRadians(angle)) * magnitude;
  let maxTTL = 30;

  //let ParticleAxisVariance = getValueInRange(-15, 15);
  //let cos = Math.cos(degreesToRadians(particleAxis + ParticleAxisVariance));
  //let sin = Math.sin(degreesToRadians(particleAxis + ParticleAxisVariance));

  return kontra.sprite({
    type: SpriteType.Particle,

    // particles originate from the same point
    // the always originate from the back of the ship
    // which is in the center of the screen
    x: position.x,
    y: position.y,

    // variance so that different particles will have
    // slightly different trajectories
    //dx: velocity.dx * dxVariance,
    //dy: velocity.dy * dyVariance,
    dx,
    dy,

    // each particle with have a slightly
    // different lifespan
    ttl: getValueInRange(0, options.ttl || maxTTL),
    dt: 0,

    // particles are small
    width: 2,
    height: 2,
    color: options.color || { r: 255, g: 255, b: 255 },

    update() {
      this.dt += 1 / 60;
      this.advance();
    },
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      // as time passes the alpha increases until particles disappear
      let frames = this.dt * 60;
      let alpha = 1 - frames / maxTTL;
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
