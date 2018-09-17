export interface CollisionStrategy {
  isApplicable(s1: Sprite, s2: Sprite): boolean;
  handleCollision(s1: Sprite, s2: Sprite): boolean;
}
