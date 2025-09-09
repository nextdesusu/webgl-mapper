import { Viewport } from "./lib/math/viewport";
import { Space2 } from "./lib/math/space2";
import { Vector2 } from "./lib/math/vector2";
import { Matrix3 } from "./lib/math/matrix3";
import { Color } from "./lib/math/color";

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
precision highp float;
uniform mat3 u_viewProjectionMatrix;
// in mat3 a_instanceTransform;
in vec2 a_position;
in vec4 a_color;
out vec4 v_color;
void main() {
  v_color = a_color;
// Multiply the position by the matrix.

  float s = float(gl_InstanceID);
  float translatedBy = 200.0;
  vec3 translation = vec3(translatedBy * s, translatedBy * s, 0);
  vec3 transformed = vec3(a_position, 1.0) + translation;
  gl_Position = vec4((u_viewProjectionMatrix * transformed).xy, 0, 1);
}
`;

  // Fragment Shader (GLSL ES 3.00)
  const fsSource = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;
void main() {
  outColor = v_color;
}
`;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

  const speed = 50;

  const cameraUniform = gl.getUniformLocation(shaderProgram, "u_viewProjectionMatrix");
  const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
  const colorLocation = gl.getAttribLocation(shaderProgram, "a_color");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const viewport = new Viewport(canvas.width, canvas.height);
  viewport.position.set(canvas.width / 2, canvas.height / 2);
  document.addEventListener("keydown", (key) => {
    const tapped = key.code;

    console.log('pressed', tapped);
    if (tapped === 'KeyA') {
      viewport.position.x += speed;
    }

    if (tapped === 'KeyD') {
      viewport.position.x -= speed;
    }

    if (tapped === 'KeyW') {
      viewport.position.y += speed;
    }

    if (tapped === 'KeyS') {
      viewport.position.y -= speed;
    }
  });

  // Create a buffer and put positions into it
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, SPRITE_GEOMETRY.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation,
    2,          // size (2 components per vertex: x, y)
    gl.FLOAT,   // type of data
    false,      // normalize data
    0,          // stride (0 means use type and size)
    0           // offset (start at the beginning of the buffer)
  );

  const instances: Instance[] = [
    new Instance(), new Instance()
  ];

  // instances[0].setPosition(600, 600);
  instances[0].color.r = 1;
  // instances[1].setPosition(300, 300);
  instances[1].color.g = 1;

  const instanceBuffers: InstanceBuffers = {
    colors: new Float32Array(Array(instances.length * 4).fill(0)),
    matrices: new Float32Array(Array(instances.length * 9).fill(0)),
  };

  function render(ts: number) {
    requestAnimationFrame(render);
    draw()
  }

  instances.forEach((instance, index) => {
    instance.sync(index, instanceBuffers);
  });

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceBuffers.colors, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(colorLocation, 1);

  requestAnimationFrame(render);
  function draw() {
    if (!gl) {
      return
    }

    checkGl(gl);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);

    const viewProjectionMatrix = viewport.viewProjectionMatrix();
    gl.uniformMatrix3fv(cameraUniform, false, viewProjectionMatrix);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, SPRITE_GEOMETRY.vertexCount, instances.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}

function checkGl(gl: WebGL2RenderingContext) {
  const error = gl.getError();

  if (error === gl.NO_ERROR) {
    return
  }

  throw Error(`GL error = ${error}`);
}

class Instance {
  transform: Matrix3;
  color: Color;
  constructor() {
    this.transform = new Matrix3();
    this.color = new Color();
  }

  setPosition(x: number, y: number) {
    this.transform.translate(new Vector2(x, y));
  }

  scale(x: number, y: number) {
    this.transform.scale(new Vector2(x, y));
  }

  sync(index: number, buffers: InstanceBuffers) {
    this.transform.copyToArray(buffers.matrices, index * 9);
    this.color.copyToArray(buffers.colors, index * 4);
  }
}

type InstanceBuffers = {
  matrices: Float32Array;
  colors: Float32Array;
}

type Geometry = {
  positions: Float32Array;
  vertexCount: number;
}

const SPRITE_GEOMETRY = planeGeometry(100, 100);

function planeGeometry(width: number, height: number): Geometry {
  // Define vertices for a square (two triangles forming a quad)
  const positions = new Float32Array([
    -width, -height, // Bottom-left -1, -1 (p1)
    width, -height, // Bottom-right  1, -1 (p2)
    -width, height, // Top-left     -1,  1 (p3) 
    -width, height, // Top-left     -1,  1 (p3)
    width, -height, // Bottom-right  1, -1 (p2)
    width, height  // Top-right      1,  1 (p4)
  ]);

  /**-10001
   * p1  p2-1
   *       00
   * p3  p401
   * -10001
   */

  return {
    positions,
    vertexCount: positions.length / 2,
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
