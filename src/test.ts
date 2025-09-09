import { Viewport } from "./lib/math/viewport";
import { Space2 } from "./lib/math/space2";
import { Vector2 } from "./lib/math/vector2";
import { Matrix3 } from "./lib/math/matrix3";
import { Color } from "./lib/math/color";
import { degreesToRadians } from "./lib/math/util";

export function runTest() {
  // Get the WebGL2 context
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl2');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

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
in mat3 a_instanceTransform;
in vec2 a_position;
in vec4 a_color;
out vec4 v_color;
void main() {
  v_color = a_color;
  gl_Position = vec4((u_viewProjectionMatrix * a_instanceTransform * vec3(a_position, 1)).xy, 0, 1);
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

  const cameraUniform = gl.getUniformLocation(shaderProgram, "u_viewProjectionMatrix");
  const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
  const colorLocation = gl.getAttribLocation(shaderProgram, "a_color");
  const instanceTransformLocation = gl.getAttribLocation(shaderProgram, "a_instanceTransform");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const viewport = new Viewport(canvas.width, canvas.height);
  viewport.position.set(canvas.width / 2, canvas.height / 2);

  const KeyboardKeyToControlKey: Record<string, keyof Controls> = {
    KeyA: "movesRight",
    KeyD: "movesLeft",
    KeyW: "movesUp",
    KeyS: "movesDown",
  }

  const scaleStep = 0.1;
  let scale = 1;

  const maxScale = 10;
  const minScale = 0.1;
  document.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) {
      scale += scaleStep;
    } else if (event.deltaY > 0) {
      scale -= scaleStep;
    }

    if (scale < minScale) {
      scale = minScale;
    }
    if (scale > maxScale) {
      scale = maxScale;
    }
    viewport.scale.set(scale, scale);
  });
  document.addEventListener("keyup", (key) => {
    const got = KeyboardKeyToControlKey[key.code];
    if (got) {
      controls[got] = false;
    }
  })
  document.addEventListener("keydown", (key) => {
    const got = KeyboardKeyToControlKey[key.code];
    console.log("PRESSED", key.code, "got", got);
    if (got) {
      controls[got] = true;
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
    new Instance(),
    new Instance()
  ];

  const controls = new Controls();

  const planet = instances[0];
  const sun = instances[1];


  const planetSize = gl.canvas.width * 0.06;
  // const halfPlanet = planetSize / 2;
  const sunSize = gl.canvas.width * 0.11;
  // const halfSun = sunSize / 2;
  const sunOrbit = planetSize * 6;

  const sunPosition = new Vector2();
  planet.color.r = 1;
  planet.scale.set(planetSize, planetSize);
  sun.transform.translate(sunPosition);
  sun.color.r = 1;
  sun.color.g = 1;
  sun.scale.set(sunSize, sunSize);

  function sunNext(time: number, rot: number) {
    const x = sunOrbit * Math.sin(time);
    const y = sunOrbit * Math.cos(time);
    sun.rotation = degreesToRadians(rot);
    // console.log("computed", x, y);

    sun.position.set(x, y);
    sun.changed();
  }

  const instanceBuffers: InstanceBuffers = {
    colors: new Float32Array(Array(instances.length * 4).fill(0)),
    matrices: new Float32Array(Array(instances.length * 9).fill(0)),
  };

  const matrixBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
  // just allocate the buffer
  gl.bufferData(gl.ARRAY_BUFFER, instanceBuffers.matrices.byteLength, gl.DYNAMIC_DRAW);

  // set all 4 attributes for matrix
  const bytesPerMatrix = 4 * 9;
  for (let i = 0; i < 3; ++i) {
    const loc = instanceTransformLocation + i;
    gl.enableVertexAttribArray(loc);
    // note the stride and offset
    const offset = i * 12;  // 3 floats per row, 4 bytes per float
    gl.vertexAttribPointer(
      loc,              // location
      3,                // size (num values to pull from buffer per iteration)
      gl.FLOAT,         // type of data in buffer
      false,            // normalize
      bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
      offset,           // offset in buffer
    );
    // this line says this attribute only changes for each 1 instance
    gl.vertexAttribDivisor(loc, 1);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceBuffers.colors, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(colorLocation, 1)

  requestAnimationFrame(render);

  let globalTotal = 0;
  let prev = 0;
  function render(total: number) {
    globalTotal = total;
    const delta = Math.max(0.1, (total - prev) / 16);
    prev = total;
    update(delta);
    requestAnimationFrame(render);
    draw()
  }

  function update(delta: number) {
    const speed = 25 * delta;

    if (controls.movesRight) {
      viewport.position.x += speed;
    }

    if (controls.movesLeft) {
      viewport.position.x -= speed;
    }

    if (controls.movesUp) {
      viewport.position.y += speed;
    }

    if (controls.movesDown) {
      viewport.position.y -= speed;
    }
  }

  function draw() {
    if (!gl) {
      return
    }

    sunNext(globalTotal * 0.001, globalTotal * 0.08);

    instances.forEach((instance, index) => {
      instance.sync(index, instanceBuffers);
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);

    const viewProjectionMatrix = viewport.viewProjectionMatrix();
    gl.uniformMatrix3fv(cameraUniform, false, viewProjectionMatrix.array);

    // upload the new matrix data
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceBuffers.matrices);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceBuffers.colors, gl.STATIC_DRAW);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, SPRITE_GEOMETRY.vertexCount, instances.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    checkGl(gl);
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
  private _changed = true;
  transform: Matrix3;
  color: Color;

  scale = new Vector2();
  position = new Vector2();
  rotation = degreesToRadians(0);

  constructor() {
    this.transform = new Matrix3();
    this.color = new Color();
  }

  changed() {
    this._changed = true;
  }

  sync(index: number, buffers: InstanceBuffers) {
    if (this._changed) {
      this.transform.identity();
      this.transform.translate(this.position);
      this.transform.rotate(this.rotation);
      this.transform.scale(this.scale);
      this._changed = false;
    }

    this.transform.copyToArray(buffers.matrices, index * 9);
    this.color.copyToArray(buffers.colors, index * 4);
  }
}

class Controls {
  movesLeft = false;
  movesRight = false;
  movesUp = false;
  movesDown = false;

  // reset() {
  //   this.movesLeft = false;
  //   this.movesRight = false;
  //   this.movesUp = false;
  //   this.movesDown = false;
  // }
}

type InstanceBuffers = {
  matrices: Float32Array;
  colors: Float32Array;
}

type Geometry = {
  positions: Float32Array;
  vertexCount: number;
}

const SPRITE_SIZE = 1;
const SPRITE_GEOMETRY = planeGeometry(SPRITE_SIZE, SPRITE_SIZE);

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
