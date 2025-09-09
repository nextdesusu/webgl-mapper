import * as math from "gl-matrix";
import { Vector2 } from "./vector2";
import { ArrayBasedStructure } from "./writeable";

const invertMat = math.mat3.create();

export class Matrix3 extends ArrayBasedStructure<math.mat3> {
  constructor(mat3 = math.mat3.create()) {
    super(mat3);
  }

  ortho() {
    
  }

  inverse() {
    const result = math.mat3.invert(invertMat, this._array);
    if (result) {
      this._array = math.mat3.copy(this._array, result);
      return true;
    }
    return false;
  }

  projection(width: number, height: number) {
    this._array = math.mat3.projection(this._array, width, height);
    return this;
  }

  identity() {
    this._array = math.mat3.identity(this._array);
    return this;
  }

  multiply(by: Matrix3) {
    this._array = math.mat3.multiply(this._array, this._array, by.array);
    return this;
  }

  translate(by: Vector2) {
    this._array = math.mat3.translate(this._array, this._array, by.array);
    return this;
  }

  scale(scale: Vector2) {
    this._array = math.mat3.scale(this._array, this._array, scale.array);
    return this;
  }

  rotate(radians: number) {
    this._array = math.mat3.rotate(this._array, this._array, radians);
    return this;
  }

  copyFrom(src: Matrix3) {
    this._array = math.mat3.copy(this._array, src.array);
    return this;
  }
}