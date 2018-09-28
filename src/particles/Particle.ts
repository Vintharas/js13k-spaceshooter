import { RGB } from "../utils";

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
