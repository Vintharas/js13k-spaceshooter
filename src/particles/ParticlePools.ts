import {
  Position,
  Velocity,
  getValueInRange,
  getCanvasPosition,
  Color,
  degreesToRadians
} from "../utils";
import { StaticParticlePool } from "./StaticParticlePool";
import { ParticleType } from "./Particle";
import { ParticlePool } from "./ParticlePool";
import { ExplosionParticlePool } from "./ExplosionParticlePool";

export class ParticlePools {
  private static particlePools = new ParticlePools();
  private staticParticlePool = StaticParticlePool();
  private particlePool = ParticlePool();
  private explosionParticlePool = ExplosionParticlePool();
  private poolsByType = {
    [ParticleType.Particle]: this.particlePool,
    [ParticleType.StaticParticle]: this.staticParticlePool,
    [ParticleType.ExplosionParticle]: this.explosionParticlePool
  };

  public get pools(): Pool[] {
    return [
      this.staticParticlePool,
      this.particlePool,
      this.explosionParticlePool
    ];
  }
  public static instance(): ParticlePools {
    return this.particlePools;
  }

  private constructor() {}

  public get(type: ParticleType, props: any): void {
    this.poolsByType[type].get(props);
  }
}
