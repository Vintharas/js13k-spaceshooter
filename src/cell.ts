import { createStaticParticle } from "./particles";
import {
  Position,
  getValueInRange,
  degreesToRadians,
  isObjectOutOfBounds,
  getCanvasPosition,
  Color
} from "./utils";
import Config from "./config";

export default function createCell(
  position: Position,
  cameraPosition: Position,
  cellType: CellType
) {
  // TODO: extract to utils
  // get arbirary direction/speed in angle...
  let angle = getValueInRange(0, 360);
  let cos = Math.cos(degreesToRadians(angle));
  let sin = Math.sin(degreesToRadians(angle));
  return kontra.sprite({
    x: position.x,
    y: position.y,
    dx: cos * Config.Cell.Speed,
    dy: sin * Config.Cell.Speed,
    ttl: Config.Cell.TTL,
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      // two concentric circles one filled one don't
      let alpha = 1 - (Config.Cell.TTL - this.ttl) / Config.Cell.TTL;
      let color = cellTypeToColor(cellType, alpha);
      this.context.save();
      this.context.strokeStyle = color;
      this.context.fillStyle = color;

      this.context.beginPath(); // start drawing a shape

      this.context.arc(
        position.x,
        position.y,
        Config.Cell.InnerRadius,
        0,
        Math.PI * 2
      );
      this.context.stroke();
      this.context.fill();

      this.context.beginPath(); // start drawing a shape
      this.context.arc(
        position.x,
        position.y,
        Config.Cell.OuterRadius,
        0,
        Math.PI * 2
      );
      this.context.stroke(); // outline the circle

      this.context.restore();
    }
  });
}

export enum CellType {
  Energy = "Energy",
  Life = "Life"
}

function cellTypeToColor(type: CellType, alpha: number): string {
  if (type === CellType.Energy) return Color.rgba(0, 255, 0, alpha);
  if (type === CellType.Life) return Color.rgba(255, 0, 0, alpha);
  return "yellow";
}
