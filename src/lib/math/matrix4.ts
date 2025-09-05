import { mat4 } from "gl-matrix";
import { Vector3 } from "./vector3";
import { ArrayBasedStructure } from "./writeable";

const _tmp1 = new Vector3();
const _tmp2 = new Vector3();
const _tmp3 = new Vector3();

export class Matrix4 extends ArrayBasedStructure<mat4> {
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

  perspective(fov: number, aspect: number, near: number, far: number) {
    this._array = mat4.perspective(this._array, fov, aspect, near, far);
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

  inverse(out = this) {
    mat4.invert(out.array, this._array);
    return out;
  }

  multiplyMatrices(a: Matrix4, b: Matrix4) {
    this._array = mat4.mul(this._array, a._array, b._array);
    return this;
  }

  lookAt(cameraPosition: Vector3, target: Vector3, up: Vector3, out = this) {
    const zAxis = _tmp1.subtractVectors(cameraPosition, target).normalize();
    const xAxis = _tmp2.crossVectors(up, zAxis).normalize();
    const yAxis = _tmp3.crossVectors(zAxis, xAxis).normalize();

    out.array[0] = xAxis.x;
    out.array[1] = xAxis.y;
    out.array[2] = xAxis.z;
    out.array[3] = 0;

    out.array[4] = yAxis.x;
    out.array[5] = yAxis.y;
    out.array[6] = yAxis.z;
    out.array[7] = 0;

    out.array[8] = zAxis.x;
    out.array[9] = zAxis.y;
    out.array[10] = zAxis.z;
    out.array[11] = 0;

    out.array[12] = cameraPosition.x;
    out.array[13] = cameraPosition.y;
    out.array[14] = cameraPosition.z;
    out.array[15] = 1;

    return out;
  }

  static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    return new Matrix4().ortho(left, right, bottom, top, near, far);
  }

  static perspective(fov: number, aspect: number, near: number, far: number) {
    return new Matrix4().perspective(fov, aspect, near, far);
  }

  static fromTranslation(vec3: Vector3) {
    return new Matrix4().fromTranslation(vec3);
  }
}
