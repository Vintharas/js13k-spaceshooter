import { CollisionStrategy, BaseCollisionStrategy } from "./CollisionStrategy";
import { Bullet } from "../bullet";
import { Scene } from "../scenes/scene";
import { Explosion } from "../effects/explosion";
import { CollisionMethods } from "./CollisionMethods";

export class BulletCollisionStrategy extends BaseCollisionStrategy {
  private haveCollided = CollisionMethods.CircleCollision.haveCollided;

  constructor(private scene: Scene) {
    super();
  }

  isApplicable(s1: Sprite, s2: Sprite): boolean {
    return s1.type === SpriteType.Bullet;
  }

  handleCollision(s1: Bullet, s2: Sprite): boolean {
    return this.handleCollisionWithBullet(s1, s2);
  }

  handleCollisionWithBullet(bullet: Bullet, sprite: Sprite): boolean {
    // circle vs. circle collision detection
    if (bullet.owner === sprite) return;
    if (bullet.owner.faction && bullet.owner.faction === sprite.faction) return;
    if (
      bullet.owner.type === SpriteType.Elder &&
      sprite.type === SpriteType.Elder
    )
      return false;

    if (this.haveCollided(bullet, sprite)) {
      // is it damageable?
      if (sprite.takeDamage) sprite.takeDamage(bullet.damage);
      bullet.ttl = 0;

      // add explosion when sprite doesn't have any life left
      if (sprite.ttl === 0)
        // particle explosion
        this.addExplosion(this.scene, sprite);
      return true;
    }

    return false;
  }

  addExplosion(scene: Scene, sprite: Sprite) {
    Explosion(scene, sprite);
  }
}
