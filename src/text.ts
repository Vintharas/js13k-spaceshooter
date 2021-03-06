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

export interface Message {
  text: string;
  type: MessageType;
}
export function Message(text: string, type = MessageType.Thought): Message {
  return { text, type };
}
export const enum MessageType {
  Thought,
  Transmission,
  Narrator
}
const MessageTypeStyles = [
  {},
  { style: "italic" },
  { color: { r: 0, g: 255, b: 0 } }
];

export function createText(
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
    family = "monospace"
  }: FontOptions = {}
) {
  if (x === undefined) {
    // centered in x
    x = Config.canvasWidth / 2 - (text.length * size * 0.65) / 2;
  }

  return kontra.sprite({
    type: SpriteType.Text,
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

export function createGameStatusText(
  text: string,
  type: MessageType = MessageType.Thought
) {
  // in order to center the text in the screen
  let typeStyles = MessageTypeStyles[type];
  let textOffset = (text.length * 12) / 2;
  return createText(
    text.toUpperCase(),
    {
      x: Config.canvasWidth / 2 - textOffset,
      y: Config.canvasHeight / 2 + 100
    },
    { ttl: 120, color: typeStyles.color },
    { size: 18, family: "monospace", style: typeStyles.style }
  );
}
