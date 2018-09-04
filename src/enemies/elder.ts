import { Ship } from "../ship/ship";
import Config from "../config";
import { getCanvasPosition } from "../utils";
import { Scene } from "../scenes/scene";
import { composeBehavior, FollowSteadyBehavior, Shoot } from "../behavior";

export interface Elder extends Sprite {}

export function ElderPool(scene: Scene, ship: Ship): Pool {
  return kontra.pool({
    create() {
      let elder = kontra.sprite({
        // pass all properties ot the kontra.sprite ctor
        type: "elder",
        // the enemies will need to have a reference
        // to the ship so they know its location
        dt: 0,
        ship,
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

      composeBehavior(elder, FollowSteadyBehavior(ship));
      composeBehavior(elder, Shoot(scene, ship));

      return elder;
    },
    maxSize: Config.Elders.MaxNumber
  });
}
