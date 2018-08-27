import { Position } from "../utils";
import Config from "../config";

export interface Camera extends Position {
  position: Position;
}

export function createCamera(
  position: Position = getDefaultCameraPosition()
): Camera {
  return {
    // Need this getters/setters so that
    // it doesn't break the expectations from
    // the previous implementation
    // which expects a "Position"
    get x() {
      return this.position.x;
    },
    set x(value) {
      this.position.x = value;
    },
    get y() {
      return this.position.y;
    },
    set y(value) {
      this.position.y = value;
    },
    position
  };
}

function getDefaultCameraPosition(): Position {
  return {
    x: Config.canvasWidth / 2,
    y: Config.canvasHeight / 2
  };
}
