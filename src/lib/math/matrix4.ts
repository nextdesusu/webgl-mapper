import { mat4 } from "gl-matrix";
import { Vector3 } from "./vector3";
import { Writeable } from "./writeable";

export class Matrix4 extends Writeable<mat4> {
  constructor(matrix: mat4 = mat4.create()) {
    super(matrix);
  }

  setPosition(pos: Vector3) {
    // 12= x
    this.fromTranslation(pos);
  }

  fromTranslation(translation: Vector3) {
    this._array = mat4.fromTranslation(this._array, translation.array);
    return this;
  }

  ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    this._array = mat4.ortho(this._array, left, right, bottom, top, near, far);
    return this;
  }

  translate(by: Vector3) {
    this._array = mat4.translate(this._array, this._array, by.array);
    return this;
  }

  scale(scale: Vector3) {
    this._array = mat4.scale(this._array, this._array, scale.array);
    return this;
  }

  static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    return new Matrix4().ortho(left, right, bottom, top, near, far);
  }

  static fromTranslation(vec3: Vector3) {
    return new Matrix4().fromTranslation(vec3);
  }
}
