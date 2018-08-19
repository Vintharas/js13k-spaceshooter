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
  cameraPosition: Position
): Position {
  // include canvasSize/2 because the camera is always pointing
  // at the middle of the canvas
  let canvasPosition: Position = {
    x: objectPosition.x - (cameraPosition.x - Config.canvasWidth / 2),
    y: objectPosition.y - (cameraPosition.y - Config.canvasHeight / 2)
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
