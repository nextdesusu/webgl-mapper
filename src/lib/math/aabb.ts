import type { Vector2 } from "./vector2";

export class AABB {
  min: Vector2;
  max: Vector2;
  constructor(min: Vector2, max: Vector2) {
    this.min = min;
    this.max = max;
  }

  
}