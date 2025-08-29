import * as math from "gl-matrix";
import { Writeable } from "./writeable";

export class Vector2 extends Writeable<math.vec2> {
  constructor(x = 0, y = 0) {
    super(math.vec2.set(math.vec2.create(), x, y));
  }

  set(x: number, y: number) {
    math.vec2.set(this._array, x, y);
    return this;
  }

  add(other: Vector2) {
    math.vec2.add(this._array, this._array, other.array);
    return this;
  }

  get x() {
    return this._array[0];
  }

  get y() {
    return this._array[1];
  }
}