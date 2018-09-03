import { Position } from "./utils";

export const Vector = {
  getMagnitude(position: Position): number {
    return Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2));
  },
  getDistance(position: Position, anotherPosition: Position): Position {
    return {
      x: position.x - anotherPosition.x,
      y: position.y - anotherPosition.y
    };
  },
  getDistanceMagnitude(position: Position, anotherPosition: Position): number {
    return Vector.getMagnitude(Vector.getDistance(position, anotherPosition));
  }
};
