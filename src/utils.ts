import Config from "./config";

export interface Position {
  x: number;
  y: number;
}
export interface Velocity {
  dx: number;
  dy: number;
}
export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface HSL {
  h: number;
  s: number;
  l: number;
}

export const Color = {
  get(alpha: number) {
    let red = getValueInRange(0, 255);
    let green = getValueInRange(0, 255);
    let blue = getValueInRange(0, 255);

    return this.rgba(red, green, blue, alpha);
  },
  rgba(red: number, green: number, blue: number, alpha: number) {
    return `rgba(${red},${green},${blue},${alpha})`;
  },
  hsla(hue: number, saturation: number, light: number, alpha: number = 1) {
    return `hsla(${hue},${saturation}%,${light}%,${alpha})`;
  }
};

export const Positions = {
  areNear(pos1: Position, pos2: Position, distance: number): boolean {
    return (
      Math.abs(pos1.x - pos2.x) < distance &&
      Math.abs(pos1.y - pos2.y) < distance
    );
  },
  inCircleGivenAngle(origin: Position, radius: number, angle: number) {
    return {
      x: origin.x + Math.cos(degreesToRadians(angle)) * radius,
      y: origin.y + Math.sin(degreesToRadians(angle)) * radius
    };
  }
};

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function getCanvasPosition(
  objectPosition: Position,
  cameraPosition: Position,
  distance: number = 0
): Position {
  // distance affects how distant objects react to the camera changing
  // distant objects move slower that close ones (something like parallax)
  // that is, moving the ship will have less effect on distant objects
  // than near ones

  // distance is a value between 0 (close) and 1 (far)
  // at most the deviation factor will be 0.8
  let deviationFactor = 1 - distance * 0.2;
  // include canvasSize/2 because the camera is always pointing
  // at the middle of the canvas
  let canvasPosition: Position = {
    x:
      objectPosition.x -
      (cameraPosition.x * deviationFactor - Config.canvasWidth / 2),
    y:
      objectPosition.y -
      (cameraPosition.y * deviationFactor - Config.canvasHeight / 2)
  };

  return canvasPosition;
}

export function isObjectOutOfBounds(
  objectPosition: Position,
  cameraPosition: Position
) {
  return (
    Math.abs(objectPosition.x - cameraPosition.x) > Config.mapBoundary ||
    Math.abs(objectPosition.y - cameraPosition.y) > Config.mapBoundary
  );
}

export function getNumberWithVariance(n: number, variance: number): number {
  return n + Math.random() * variance;
}

export function getValueInRange(bottom: number, top: number): number {
  return Math.random() * (top - bottom) + bottom;
}

export function getIntegerInRange(bottom: number, top: number): number {
  // enlarging the max value by 1
  // and using MAth.floor ensures that
  // every integer will have the same probability of happening
  // (since they're assigned a range of 1)
  // (if we Math.round the limits could just get 0.5 e.g. 0 - 0.5 becomes 0
  // while 0.5-1.5 becomes 1 )
  return Math.floor(getValueInRange(bottom, top + 1));
}

export function getRandomValueOf(values: any[]) {
  const max = values.length - 1;
  const index = getIntegerInRange(0, max);
  return values[index];
}
