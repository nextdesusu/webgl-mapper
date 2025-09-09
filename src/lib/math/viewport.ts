import { mat3 } from "gl-matrix";
import { Matrix3 } from "./matrix3";
import { degreesToRadians } from "./util";
import { Vector2 } from "./vector2";


/**
 * https://webglfundamentals.org/webgl/lessons/webgl-2d-matrices.html
 */
export class Viewport {
  scale = Vector2.one();
  position = new Vector2();
  screenSize: Vector2;
  rotation = degreesToRadians(0);

  private _camera = new Matrix3();
  private _view = new Matrix3();
  private _projection = new Matrix3();

  constructor(w: number, h: number) {
    this.screenSize = new Vector2(w, h);
  }

  viewProjectionMatrix() {
    // const projection = this._projection.projection(this.screenSize.x, this.screenSize.y);
    // const camera = this._camera.identity()
    //   .translate(this.position)
    //   .rotate(this.rotation)
    //   .scale(this.scale);

    // // view.inverse();
    // console.group();
    // console.log('pos', this.position.array);
    // console.log('projection', projection.array, "camera", camera.array);

    // const ret = projection.multiply(camera);
    // console.log("ret", ret.array)
    // console.groupEnd();

    // return ret;

    // const projectionMatrix = mat3.projection(mat3.create(), this.screenSize.x, this.screenSize.y);
    // const translationMatrix = mat3.translate(mat3.create(), mat3.create(), this.position.array);
    // const rotationMatrix = mat3.rotate(mat3.create(), mat3.create(), this.rotation);
    // const scaleMatrix = mat3.scale(mat3.create(), mat3.create(), this.scale.array);

    // // Multiply the matrices.
    // let matrix = mat3.multiply(mat3.create(), projectionMatrix, translationMatrix);
    // matrix = mat3.multiply(matrix, matrix, rotationMatrix);
    // matrix = mat3.multiply(matrix, matrix, scaleMatrix);

    const projectionMatrix = m3.projection(this.screenSize.x, this.screenSize.y);
    const translationMatrix = m3.translation(this.position.x, this.position.y);
    const rotationMatrix = m3.rotation(this.rotation);
    const scaleMatrix = m3.scaling(this.scale.x, this.scale.y);

    // Multiply the matrices.
    let matrix = m3.multiply(projectionMatrix, translationMatrix);
    matrix = m3.multiply(matrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);
    return matrix;
  }
}

const m3 = {
  projection: function (width: number, height: number) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  identity: function () {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  translation: function (tx: number, ty: number) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function (angleInRadians: number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function (sx: number, sy: number) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function (a: number[], b: number[]) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};