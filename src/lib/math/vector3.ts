import * as math from "gl-matrix";
import { ArrayBasedStructure } from "./writeable";

const X_INDEX = 0;
const Y_INDEX = 1;
const Z_INDEX = 2;

export class Vector3 extends ArrayBasedStructure<math.vec3> {
  constructor(x = 0, y = 0, z = 0) {
    super(math.vec3.set(math.vec3.create(), x, y, z));
  }

  static up() {
    return new Vector3(0, 1, 0);
  }

  static zero() {
    return new Vector3();
  }

  subtractVectors(a: Vector3, b: Vector3) {
    this._array = math.vec3.sub(this.array, a.array, b.array);
    return this;
  }

  crossVectors(a: Vector3, b: Vector3) {
    this._array = math.vec3.cross(this._array, a._array, b._array);
    return this;
  }

  subtract(other: Vector3) {
    this._array = math.vec3.sub(this.array, this._array, other.array);
    return this;
  }

  normalize() {
    this._array = math.vec3.normalize(this._array, this._array);
    return this;
  }

  set(x: number, y: number, z: number) {
    math.vec3.set(this._array, x, y, z);
    return this;
  }

  add(other: Vector3) {
    math.vec3.add(this._array, this._array, other.array);
    return this;
  }

  set x(value: number) {
    this._array[X_INDEX] = value;
  }

  set y(value: number) {
    this._array[Y_INDEX] = value;
  }

  get x() {
    return this._array[X_INDEX];
  }

  get y() {
    return this._array[Y_INDEX];
  }

  get z() {
    return this._array[Z_INDEX];
  }

  set z(value: number) {
    this._array[Z_INDEX] = value;
  }
}