import { createStar, Star } from "./star";
import { Position } from "./utils";
import Config from "./config";

export interface SpaceBackground extends Sprite {
  stars: Star[];
}

export function SpaceBackground(cameraPosition: Position) {
  let shipInitialX = Config.canvasWidth / 2;
  let spaceBetweenStars = 75;
  let offset = 500;
  let start = shipInitialX - Config.canvasWidth / 2 - offset;
  let end = shipInitialX + Config.canvasWidth / 2 + offset;
  let distanceToRefresh = Config.canvasWidth / 2 + offset;
  let distanceNewPosition = Config.canvasWidth + 2 * offset;
  // TODO: separate width/height
  // right now this works well cuz in desktop width > height
  let stars = createStars({
    start,
    end,
    spaceBetweenStars,
    cameraPosition
  });
  return kontra.sprite({
    type: SpriteType.Background,
    x: start,
    y: start,
    stars,
    dt: 0,
    ttl: Infinity,
    update(this: SpaceBackground) {
      this.dt += 1 / 60;
      if (this.dt > 0.25) {
        let starsFarLeft = this.stars.filter(
          s => cameraPosition.x - s.x > distanceToRefresh
        );
        starsFarLeft.forEach(s => (s.x = s.x + distanceNewPosition));

        let starsFarRight = this.stars.filter(
          s => Math.abs(cameraPosition.x - s.x) > distanceToRefresh
        );
        starsFarRight.forEach(s => (s.x = s.x - distanceNewPosition));

        let starsFarUp = this.stars.filter(
          s => cameraPosition.y - s.y > distanceToRefresh
        );
        starsFarUp.forEach(s => (s.y = s.y + distanceNewPosition));

        let starsFarDown = this.stars.filter(
          s => Math.abs(cameraPosition.y - s.y) > distanceToRefresh
        );
        starsFarDown.forEach(s => (s.y = s.y - distanceNewPosition));
      }
      // if the camera has moved, change the position of the
      // farthest stars to reuse them
    },
    render(this: SpaceBackground) {
      this.stars.forEach(s => s.render());
    }
  });
}

// creates initial amount of stars surrounding the spaceship
interface StarsBuilder {
  start: number;
  end: number;
  spaceBetweenStars: number;
  cameraPosition: Position;
}

function createStars({
  start,
  end,
  spaceBetweenStars,
  cameraPosition
}: StarsBuilder) {
  let stars = [];
  for (var x = start; x <= end; x += spaceBetweenStars) {
    for (var y = start; y <= end; y += spaceBetweenStars) {
      let star = createStar({ x, y, cameraPosition });
      stars.push(star);
    }
  }
  return stars;
}
