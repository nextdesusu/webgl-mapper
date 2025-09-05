import { numberInRange } from "./number";
import type { Vector2 } from "./vector2";

export class Space2 {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  constructor(maxX: number, maxY: number, minX = 0, minY = 0) {
    this.maxX = maxX;
    this.maxY = maxY;
    this.minX = minX;
    this.minY = minY;
  }

  transform(bySpace: Space2, vec2: Vector2, out = vec2) {
    const newX = numberInRange(this.minX, this.maxX, bySpace.minX, bySpace.maxX, vec2.x);
    const newY =  numberInRange(this.minY, this.maxY, bySpace.minY, bySpace.maxY, vec2.y);
    return out.set(newX, newY);
  }
}