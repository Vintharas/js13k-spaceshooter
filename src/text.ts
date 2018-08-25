import { Position, Velocity, RGB, Color, getCanvasPosition } from "./utils";
import Config from "./config";

export interface FontOptions {
  style?: string;
  weight?: string;
  size?: number;
  family?: string;
}
export interface TextOptions {
  velocity?: Velocity;
  ttl?: number;
  color?: RGB;
  cameraPosition?: Position;
}

export default function createText(
  text: string,
  { x, y }: Position,
  {
    velocity: { dx, dy } = { dx: 0, dy: 0 },
    ttl = Infinity,
    color: { r, g, b } = { r: 255, g: 255, b: 255 },
    cameraPosition
  }: TextOptions = {},
  {
    style = "normal",
    weight = "normal",
    size = 24,
    family = "serif"
  }: FontOptions = {}
) {
  return kontra.sprite({
    x,
    y,
    dx,
    dy,
    ttl,
    maxTTL: ttl,
    render() {
      // TODO: having moving and non moving text
      // in the same function is kind of a mess
      // separate into two separate functions
      let alpha = this.getAlpha();
      this.context.fillStyle = Color.rgba(r, g, b, alpha);
      this.context.font = `${style} ${weight} ${size}px ${family}`;
      if (cameraPosition) {
        let position = getCanvasPosition(
          { x: this.x, y: this.y },
          cameraPosition
        );
        this.context.fillText(text, position.x, position.y);
      } else {
        this.context.fillText(text, x, y);
      }
    },
    getAlpha() {
      let TTLvanish = this.maxTTL / 2;
      if (this.ttl < Infinity && this.ttl < TTLvanish) {
        return 1 - (TTLvanish - this.ttl) / TTLvanish;
      } else return 1;
    }
  });
}

export function createGameStatusText(text: string) {
  // in order to center the text in the screen
  let textOffset = (text.length * 12) / 2;
  return createText(
    text,
    { x: Config.canvasWidth / 2 - textOffset, y: 400 },
    { ttl: 120 },
    { size: 18, family: "monospace" }
  );
}
