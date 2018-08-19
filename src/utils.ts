import Config from "./config";

export interface Position {
  x: number;
  y: number;
}
export interface Velocity {
  dx: number;
  dy: number;
}

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

export function getNumberWithVariance(n: number, variance: number) {
  return n + Math.random() * variance;
}

export function getValueInRange(bottom: number, top: number) {
  return Math.random() * (top - bottom) + bottom;
}
