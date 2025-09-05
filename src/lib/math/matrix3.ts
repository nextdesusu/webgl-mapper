import * as math from "gl-matrix";
import { Vector2 } from "./vector2";
import { ArrayBasedStructure } from "./writeable";

export class Matrix3 extends ArrayBasedStructure<math.mat3> {
  constructor(mat3 = math.mat3.create()) {
    super(mat3);
  }

  setPosition(pos: Vector2) {
    // Это не тот метод но пока хватит
    math.mat3.fromTranslation(this._array, pos.array);
    return this;
  }

  move(by: Vector2) {
    math.mat3.translate(this._array, this._array, by.array);
    return this;
  }

  setScale(scale: Vector2) {
    math.mat3.scale(this._array, this._array, scale.array);
    return this;
  }

  setRotation(rot: number) {
    math.mat3.rotate(this._array, this._array, rot);
    return this;
  }

  multiplyByMatrix3(by: Matrix3) {
    math.mat3.multiply(this._array, this._array, by.array);
    return this;
  }

  copy(src: Matrix3) {
    math.mat3.copy(this._array, src.array);
    return this;
  }
}