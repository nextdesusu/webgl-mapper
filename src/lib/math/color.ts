import { ArrayBasedStructure } from "./writeable";

export class Color extends ArrayBasedStructure<Float32Array> {
  constructor(r = 0, g = 0, b = 0, a = 1) {
    super(new Float32Array([
      r,
      g,
      b,
      a
    ]));
  }

  set r(value: number) {
    this._array[0] = value;
  }

  get r() {
    return this._array[0];
  }

  set g(value: number) {
    this._array[1] = value;
  }

  get g() {
    return this._array[1];
  }

  set b(value: number) {
    this._array[2] = value;
  }

  get b() {
    return this._array[2];
  }

  set a(value: number) {
    this._array[3] = value;
  }

  get a() {
    return this._array[3];
  }
}