import * as math from "gl-matrix";
import { Writeable } from "./writeable";

export class Vector3 extends Writeable<math.vec3> {
  constructor(x = 0, y = 0, z = 0) {
    super(math.vec3.set(math.vec3.create(), x, y, z));
  }

  set(x: number, y: number, z: number) {
    math.vec3.set(this._array, x, y, z);
    return this;
  }

  add(other: Vector3) {
    math.vec3.add(this._array, this._array, other.array);
    return this;
  }

  get x() {
    return this._array[0];
  }

  get y() {
    return this._array[1];
  }

  get z() {
    return this._array[2];
  }
}