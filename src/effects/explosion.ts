import { Scene } from "../scenes/scene";
import { ExplosionParticle } from "../particles/ParticlePools";
import { Particle } from "../particles/Particle";
import { getRandomValueOf } from "../utils";
import { callTimes } from "../fp";

interface Explosion {
  particles: Particle[];
}

const red = { r: 255, g: 0, b: 0 };
const orange = { r: 255, g: 165, b: 0 };
const yellow = { r: 255, g: 255, b: 0 };
const explosionColors = [red, orange, yellow];

export function Explosion(scene: Scene, sprite: Sprite): Explosion {
  // The size of the explosion is based on the size of the
  // sprite that explodes
  // TODO: unify this for the love of gooood!
  let spriteSize = sprite.radius || sprite.width || sprite.size;
  let numberOfParticles = Math.round(spriteSize * 10);

  let particles = callTimes(numberOfParticles, () => {
    let color = getRandomValueOf(explosionColors);
    return ExplosionParticle(sprite, scene.cameraPosition, {
      ttl: 50,
      color,
      magnitude: spriteSize / 2
    });
  });
  return { particles };
}
