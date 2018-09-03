import { Ship } from "../ship/ship";
import Config from "../config";
import { getCanvasPosition, radiansToDegrees } from "../utils";
import { Vector } from "../vector";
import createBullet from "../bullet";
import { Scene } from "../scenes/scene";

export interface Elder extends Sprite {}

export function ElderPool(scene: Scene, ship: Ship): Pool {
  return kontra.pool({
    create() {
      return kontra.sprite({
        // pass all properties ot the kontra.sprite ctor
        type: "elder",
        // the enemies will need to have a reference
        // to the ship so they know its location
        dt: 0,
        ship,
        update() {
          // let's test having them just follow
          // the players ship
          this.dt += 1 / 60;
          let distanceToShip = Vector.getDistanceMagnitude(this, ship);
          if (distanceToShip < 500 && this.dt > 0.25) {
            // follow ship
            this.dt = 0;
            let speed = 2;
            let distance = Vector.getDistance(ship, this);
            this.dx = (speed * distance.x) / distanceToShip;
            this.dy = (speed * distance.y) / distanceToShip;
            if (distanceToShip < 300) {
              // fire
              // TODO: refactor bullets!
              let angle = radiansToDegrees(Math.atan2(this.dy, this.dx));
              const bullet = createBullet(this, this, angle, ship, scene);
              scene.addSprite(bullet);
            }
          }
          this.advance();
        },
        render(this: Elder) {
          let position = getCanvasPosition(this, this.ship);

          this.context.save();
          this.context.translate(position.x, position.y);
          this.context.rotate((Math.PI * 1) / 4);
          this.context.fillStyle = "gray";
          this.context.fillRect(0, 0, 20, 20);
          this.context.restore();

          if (Config.debug && Config.showPath) {
            this.context.save();
            this.context.translate(position.x + 10, position.y + 10);
            this.context.beginPath();
            this.context.strokeStyle = "red";
            this.context.moveTo(0, 0);
            this.context.lineTo(this.dx * 20, this.dy * 20);
            this.context.stroke();
            this.context.restore();
          }
        }
      });
    },
    maxSize: Config.Elders.MaxNumber
  });
}

// TODO: refactor into reusable and composable behaviors
// later
export enum EnemyBehavior {
  Follow,
  Shoot
}
