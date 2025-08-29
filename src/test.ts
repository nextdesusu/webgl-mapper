import { Matrix3 } from "./lib/math/matrix3";
import { Matrix4 } from "./lib/math/matrix4";
import { Space2 } from "./lib/math/space2";
import { Vector2 } from "./lib/math/vector2";
import { Vector3 } from "./lib/math/vector3";

export function runTest() {
  // Get the WebGL2 context
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw Error('Unable to initialize WebGL2. Your browser may not support it.')
  }

  const canvasSquare = new Space2(canvas.width, canvas.height);
  // const screenSpace = new Space2(1, 1, -1, -1);
  const modelScaleSpace = new Space2(1, 1);

  // Vertex Shader (GLSL ES 3.00)
  const vsSource = `#version 300 es
uniform mat4 u_viewProjectionMatrix;
in vec4 a_position;
void main() {
    gl_Position = a_position * u_viewProjectionMatrix;
}
`;

  // Fragment Shader (GLSL ES 3.00)
  const fsSource = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() {
    outColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
}
`;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(shaderProgram);

  const size = 0.5;

  const geomSize = canvasSquare.transformVector2(modelScaleSpace, new Vector2(canvas.width * size, canvas.height * size));
  // debugger
  const geom = planeGeometry(geomSize.x, geomSize.y);
  // Create a buffer and put positions into it
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geom.positions, gl.STATIC_DRAW);
  // Get attribute location and enable it
  const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
  const camera = new Camera({ left: 0, right: gl.canvas.width, bottom: gl.canvas.height, top: 0});

  const speed = 0.1;
  document.addEventListener("keydown", (key) => {
    const tapped = key.code;

    console.log('pressed', tapped);
    if (tapped === 'KeyA') {
      camera.position.x -= speed;
    }

    if (tapped === 'KeyD') {
      camera.position.x += speed;
    }
  });

  const cameraUniform = gl.getUniformLocation(shaderProgram, "u_viewProjectionMatrix");

  function render(ts: number) {
    requestAnimationFrame(render);
    draw()
  }

  requestAnimationFrame(render);
  function draw() {
    if (!gl) {
      return
    }

    camera.sync();
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(cameraUniform, false, camera.matrix.array);

    gl.enableVertexAttribArray(positionAttributeLocation);
    // Tell the attribute how to get data out of positionBuffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      2,          // size (2 components per vertex: x, y)
      gl.FLOAT,   // type of data
      false,      // normalize data
      0,          // stride (0 means use type and size)
      0           // offset (start at the beginning of the buffer)
    );
    gl.drawArrays(gl.TRIANGLES, 0, geom.vertexCount); // Draw 6 vertices (2 triangles)
  }
}

type Geometry = {
  positions: Float32Array;
  vertexCount: number;
}

function planeGeometry(width: number, height: number): Geometry {
  // Define vertices for a square (two triangles forming a quad)
  const positions = new Float32Array([
    -width, -height, // Bottom-left
    width, -height, // Bottom-right
    -width, height, // Top-left

    -width, height, // Top-left
    width, -height, // Bottom-right
    width, height  // Top-right
  ]);

  return {
    positions,
    vertexCount: positions.length / 2,
  }
}

type CameraProps = {
  left: number,
  right: number,
  bottom: number,
  top: number,
  near?: number,
  far?: number,
  center?: Vector3,
  up?: Vector3,
}

class Camera {
  position: Vector3;
  center: Vector3;
  up: Vector3;
  zoom: number;
  matrix: Matrix4;

  constructor({ left, right, bottom, top, near = -1, far = 1, up = Vector3.up(), center = Vector3.zero() }: CameraProps) {
    this.matrix = Matrix4.ortho(left, right, bottom, top, near, far);
    this.zoom = 1;
    this.position = new Vector3();
    this.up = up,
    this.center = center;
  }

  sync() {
    this.matrix.setPosition(this.position);
    console.log('matrix', this.matrix.array);
  }
}


// Create and link program
function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const text = 'Program linking error:' + gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw Error(text);
  }
  return program;
}

// Create and compile shaders
function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw Error(`Failed to create shader type = ${type}`);
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw Error("Failed to compile shader!");
  }
  return shader;
}