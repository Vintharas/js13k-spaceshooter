import {
  Position,
  Velocity,
  getValueInRange,
  getCanvasPosition,
  Color,
  degreesToRadians
} from "./utils";

// particles that don't take into account cameraPosition
// TODO: refactor these two so they use common code
export function createStaticParticle(
  position: Position,
  velocity: Velocity,
  particleAxis: number
): any {
  let dxVariance = getValueInRange(0.5, 1.5);
  let dyVariance = getValueInRange(0.5, 1.5);
  let ParticleAxisVariance = getValueInRange(-20, 20);
  let maxTTL = 50;

  const cos = Math.cos(degreesToRadians(particleAxis + ParticleAxisVariance));
  const sin = Math.sin(degreesToRadians(particleAxis + ParticleAxisVariance));

  return kontra.sprite({
    type: "particle",

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
    ttl: getValueInRange(0, maxTTL),
    dt: 0,

    // particles are small
    width: 2,
    height: 2,

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
      //this.context.fillStyle = Color.rgba(255, 255, 255, alpha);
      //this.context.fillRect(this.x, this.y, this.width, this.height);

      this.context.save();
      this.context.translate(this.x, this.y);
      this.context.rotate(degreesToRadians(particleAxis));
      this.context.fillStyle = Color.rgba(255, 255, 255, alpha);
      this.context.fillRect(4, this.thicknessVariance, this.width, this.height);
      this.context.restore();
    }
  });
}

// particle that takes into account camera position
export function createParticle(
  position: Position,
  velocity: Velocity,
  cameraPosition: Position,
  particleAxis: number
): any {
  let dxVariance = getValueInRange(0.5, 1.5);
  let dyVariance = getValueInRange(0.5, 1.5);
  let ParticleAxisVariance = getValueInRange(-15, 15);
  let maxTTL = 30;

  const cos = Math.cos(degreesToRadians(particleAxis + ParticleAxisVariance));
  const sin = Math.sin(degreesToRadians(particleAxis + ParticleAxisVariance));

  return kontra.sprite({
    type: "particle",

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
    ttl: getValueInRange(0, maxTTL),
    dt: 0,

    // particles are small
    width: 2,
    height: 2,
    update() {
      this.dt += 1 / 60;
      this.advance();
    },
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      // as time passes the alpha increases until particles disappear
      let frames = this.dt * 60;
      let alpha = 1 - frames / maxTTL;
      this.context.fillStyle = Color.rgba(255, 255, 255, alpha);
      this.context.fillRect(position.x, position.y, this.width, this.height);
    }
  });
}
