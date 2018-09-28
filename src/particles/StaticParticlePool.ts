import { Position, degreesToRadians, Color, getValueInRange } from "../utils";

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
