// Get the WebGL2 context
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2');

if (!gl) {
  throw Error('Unable to initialize WebGL2. Your browser may not support it.')
}

// Vertex Shader (GLSL ES 3.00)
const vsSource = `#version 300 es
in vec4 a_position;
void main() {
    gl_Position = a_position;
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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

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

const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(shaderProgram);

// Define vertices for a square (two triangles forming a quad)
const positions = new Float32Array([
  -0.5, -0.5, // Bottom-left
  0.5, -0.5, // Bottom-right
  -0.5, 0.5, // Top-left

  -0.5, 0.5, // Top-left
  0.5, -0.5, // Bottom-right
  0.5, 0.5  // Top-right
]);

// Create a buffer and put positions into it
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

// Get attribute location and enable it
const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');
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

// Draw the square
gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 6); // Draw 6 vertices (2 triangles)