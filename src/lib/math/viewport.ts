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
  private _projection = new Matrix3();

  constructor(w: number, h: number) {
    this.screenSize = new Vector2(w, h);
  }

  viewProjectionMatrix() {
    const projection = this._projection.identity().projection(this.screenSize.x, this.screenSize.y);
    const camera = this._camera.identity()
      .translate(this.position)
      .rotate(this.rotation)
      .scale(this.scale);

    return projection.multiply(camera);
  }
}
