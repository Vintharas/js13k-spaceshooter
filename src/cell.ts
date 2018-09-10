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

export interface Cell extends Sprite {
  cellType: CellType;
  outerRadius: number;
}

const OuterRadius = 8;
const InnerRadius = 2;
const TTL = 240;
const Speed = 0.7;

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
    type: SpriteType.Cell,
    cellType,
    x: position.x,
    y: position.y,
    dx: cos * Speed,
    dy: sin * Speed,
    outerRadius: OuterRadius,
    ttl: TTL,
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      // two concentric circles one filled one don't
      let alpha = 1 - (TTL - this.ttl) / TTL;
      let color = cellTypeToColor(cellType, alpha);
      this.context.save();
      this.context.strokeStyle = color;
      this.context.fillStyle = color;

      this.context.beginPath(); // start drawing a shape

      this.context.arc(position.x, position.y, InnerRadius, 0, Math.PI * 2);
      this.context.stroke();
      this.context.fill();

      this.context.beginPath(); // start drawing a shape
      this.context.arc(position.x, position.y, OuterRadius, 0, Math.PI * 2);
      this.context.stroke(); // outline the circle

      this.context.restore();
    }
  });
}

export const enum CellType {
  Energy,
  Life
}

function cellTypeToColor(type: CellType, alpha: number): string {
  if (type === CellType.Energy) return Color.rgba(0, 255, 0, alpha);
  if (type === CellType.Life) return Color.rgba(255, 0, 0, alpha);
  return "yellow";
}

export function getRandomCellType(): CellType {
  const cellTypes = [CellType.Energy, CellType.Life];
  const index = Math.round(Math.random());
  return cellTypes[index];
}
