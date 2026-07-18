"use client";

import { useEffect, useRef } from "react";

type BodyView = "front" | "back";

type MuscleOption = {
  id: string;
  name: string;
  view: BodyView;
};

type Anatomy3DProps = {
  view: BodyView;
  activeId: string;
  muscles: MuscleOption[];
  playing: boolean;
  onSelect: (id: string) => void;
};

type Vec3 = [number, number, number];
type Mat4 = Float32Array;

type ModelPart = {
  id?: string;
  position: Vec3;
  scale: Vec3;
  rotation?: Vec3;
  color?: Vec3;
};

const BASE_PARTS: ModelPart[] = [
  { position: [0, 2.2, 0], scale: [0.42, 0.52, 0.4], color: [0.72, 0.69, 0.63] },
  { position: [0, 1.73, 0], scale: [0.23, 0.3, 0.24], color: [0.57, 0.54, 0.49] },
  { position: [0, 0.8, 0], scale: [0.72, 1.08, 0.38], color: [0.44, 0.43, 0.39] },
  { position: [0, -0.12, 0], scale: [0.64, 0.48, 0.4], color: [0.5, 0.47, 0.43] },
  { position: [-0.83, 1.13, 0], scale: [0.27, 0.7, 0.26], rotation: [0, 0, -0.17] },
  { position: [0.83, 1.13, 0], scale: [0.27, 0.7, 0.26], rotation: [0, 0, 0.17] },
  { position: [-1.04, 0.12, 0], scale: [0.2, 0.65, 0.2], rotation: [0, 0, -0.08] },
  { position: [1.04, 0.12, 0], scale: [0.2, 0.65, 0.2], rotation: [0, 0, 0.08] },
  { position: [-1.1, -0.52, 0.07], scale: [0.2, 0.2, 0.16] },
  { position: [1.1, -0.52, 0.07], scale: [0.2, 0.2, 0.16] },
  { position: [-0.35, -1.0, 0], scale: [0.35, 0.92, 0.34], rotation: [0, 0, -0.025] },
  { position: [0.35, -1.0, 0], scale: [0.35, 0.92, 0.34], rotation: [0, 0, 0.025] },
  { position: [-0.37, -2.19, 0], scale: [0.26, 0.78, 0.25] },
  { position: [0.37, -2.19, 0], scale: [0.26, 0.78, 0.25] },
  { position: [-0.38, -2.89, 0.16], scale: [0.31, 0.18, 0.55], rotation: [0.08, 0, 0] },
  { position: [0.38, -2.89, 0.16], scale: [0.31, 0.18, 0.55], rotation: [0.08, 0, 0] },
];

const MUSCLE_PARTS: ModelPart[] = [
  { id: "deltoid", position: [-0.75, 1.4, 0.24], scale: [0.29, 0.38, 0.17] },
  { id: "deltoid", position: [0.75, 1.4, 0.24], scale: [0.29, 0.38, 0.17] },
  { id: "chest", position: [-0.34, 1.03, 0.36], scale: [0.37, 0.42, 0.12], rotation: [0, 0, -0.06] },
  { id: "chest", position: [0.34, 1.03, 0.36], scale: [0.37, 0.42, 0.12], rotation: [0, 0, 0.06] },
  { id: "biceps", position: [-0.9, 0.82, 0.24], scale: [0.19, 0.46, 0.13], rotation: [0, 0, -0.15] },
  { id: "biceps", position: [0.9, 0.82, 0.24], scale: [0.19, 0.46, 0.13], rotation: [0, 0, 0.15] },
  { id: "forearm", position: [-1.05, 0.02, 0.19], scale: [0.14, 0.46, 0.11], rotation: [0, 0, -0.08] },
  { id: "forearm", position: [1.05, 0.02, 0.19], scale: [0.14, 0.46, 0.11], rotation: [0, 0, 0.08] },
  { id: "abs", position: [0, 0.4, 0.38], scale: [0.25, 0.62, 0.1] },
  { id: "obliques", position: [-0.45, 0.35, 0.3], scale: [0.18, 0.55, 0.09], rotation: [0, 0, -0.12] },
  { id: "obliques", position: [0.45, 0.35, 0.3], scale: [0.18, 0.55, 0.09], rotation: [0, 0, 0.12] },
  { id: "adductors", position: [-0.17, -1.03, 0.24], scale: [0.17, 0.57, 0.12], rotation: [0, 0, -0.05] },
  { id: "adductors", position: [0.17, -1.03, 0.24], scale: [0.17, 0.57, 0.12], rotation: [0, 0, 0.05] },
  { id: "quadriceps", position: [-0.39, -1.12, 0.3], scale: [0.23, 0.64, 0.13] },
  { id: "quadriceps", position: [0.39, -1.12, 0.3], scale: [0.23, 0.64, 0.13] },
  { id: "tibialis", position: [-0.36, -2.17, 0.23], scale: [0.12, 0.48, 0.09] },
  { id: "tibialis", position: [0.36, -2.17, 0.23], scale: [0.12, 0.48, 0.09] },
  { id: "trapezius", position: [0, 1.25, -0.37], scale: [0.46, 0.61, 0.1] },
  { id: "rotator-cuff", position: [-0.58, 1.32, -0.34], scale: [0.24, 0.3, 0.09] },
  { id: "rotator-cuff", position: [0.58, 1.32, -0.34], scale: [0.24, 0.3, 0.09] },
  { id: "triceps", position: [-0.88, 0.79, -0.24], scale: [0.18, 0.47, 0.12], rotation: [0, 0, -0.15] },
  { id: "triceps", position: [0.88, 0.79, -0.24], scale: [0.18, 0.47, 0.12], rotation: [0, 0, 0.15] },
  { id: "lats", position: [-0.39, 0.58, -0.36], scale: [0.26, 0.68, 0.1], rotation: [0, 0, -0.08] },
  { id: "lats", position: [0.39, 0.58, -0.36], scale: [0.26, 0.68, 0.1], rotation: [0, 0, 0.08] },
  { id: "erectors", position: [-0.13, 0.3, -0.39], scale: [0.09, 0.78, 0.08] },
  { id: "erectors", position: [0.13, 0.3, -0.39], scale: [0.09, 0.78, 0.08] },
  { id: "glutes", position: [-0.32, -0.22, -0.37], scale: [0.31, 0.41, 0.14] },
  { id: "glutes", position: [0.32, -0.22, -0.37], scale: [0.31, 0.41, 0.14] },
  { id: "hamstrings", position: [-0.37, -1.27, -0.3], scale: [0.23, 0.63, 0.13] },
  { id: "hamstrings", position: [0.37, -1.27, -0.3], scale: [0.23, 0.63, 0.13] },
  { id: "calves", position: [-0.37, -2.18, -0.26], scale: [0.18, 0.49, 0.12] },
  { id: "calves", position: [0.37, -2.18, -0.26], scale: [0.18, 0.49, 0.12] },
];

const identity = (): Mat4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row] * b[column * 4] +
        a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] +
        a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function translation(x: number, y: number, z: number): Mat4 {
  const out = identity();
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

function scaling(x: number, y: number, z: number): Mat4 {
  const out = identity();
  out[0] = x;
  out[5] = y;
  out[10] = z;
  return out;
}

function rotationX(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

function rotationY(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function rotationZ(angle: number): Mat4 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function perspective(fieldOfView: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fieldOfView / 2);
  const range = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * range, -1,
    0, 0, 2 * near * far * range, 0,
  ]);
}

function transformPoint(matrix: Mat4, point: Vec3): [number, number, number, number] {
  const [x, y, z] = point;
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
    matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15],
  ];
}

function buildSphere(latitudeBands = 18, longitudeBands = 24) {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let latitude = 0; latitude <= latitudeBands; latitude += 1) {
    const theta = (latitude * Math.PI) / latitudeBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    for (let longitude = 0; longitude <= longitudeBands; longitude += 1) {
      const phi = (longitude * Math.PI * 2) / longitudeBands;
      const x = Math.cos(phi) * sinTheta;
      const y = cosTheta;
      const z = Math.sin(phi) * sinTheta;
      vertices.push(x, y, z, x, y, z);
    }
  }
  for (let latitude = 0; latitude < latitudeBands; latitude += 1) {
    for (let longitude = 0; longitude < longitudeBands; longitude += 1) {
      const first = latitude * (longitudeBands + 1) + longitude;
      const second = first + longitudeBands + 1;
      indices.push(first, second, first + 1, second, second + 1, first + 1);
    }
  }
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "WebGL shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    uniform mat4 u_projection_view;
    uniform mat4 u_world_model;
    varying vec3 v_normal;
    varying vec3 v_position;
    void main() {
      vec4 world_position = u_world_model * vec4(a_position, 1.0);
      gl_Position = u_projection_view * world_position;
      v_normal = mat3(u_world_model) * a_normal;
      v_position = world_position.xyz;
    }
  `);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec3 u_color;
    uniform float u_emphasis;
    varying vec3 v_normal;
    varying vec3 v_position;
    void main() {
      vec3 normal = normalize(v_normal);
      vec3 light = normalize(vec3(-0.35, 0.72, 1.0));
      float diffuse = max(dot(normal, light), 0.0);
      float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
      vec3 color = u_color * (0.36 + diffuse * 0.72) + rim * (0.08 + u_emphasis * 0.14);
      gl_FragColor = vec4(color, 1.0);
    }
  `);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "WebGL program link failed");
  }
  return program;
}

export default function Anatomy3D({ view, activeId, muscles, playing, onSelect }: Anatomy3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yawRef = useRef(view === "front" ? 0 : Math.PI);
  const pitchRef = useRef(-0.04);
  const zoomRef = useRef(7.5);
  const targetYawRef = useRef(yawRef.current);
  const snapRef = useRef(true);
  const propsRef = useRef({ activeId, playing, onSelect });
  const hitPointsRef = useRef<{ id: string; x: number; y: number; depth: number }[]>([]);

  propsRef.current = { activeId, playing, onSelect };

  useEffect(() => {
    targetYawRef.current = view === "front" ? 0 : Math.PI;
    snapRef.current = true;
  }, [view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    const program = createProgram(gl);
    const sphere = buildSphere();
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    if (!vertexBuffer || !indexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const normalLocation = gl.getAttribLocation(program, "a_normal");
    const projectionViewLocation = gl.getUniformLocation(program, "u_projection_view");
    const worldModelLocation = gl.getUniformLocation(program, "u_world_model");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const emphasisLocation = gl.getUniformLocation(program, "u_emphasis");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    let animationFrame = 0;
    let dragging = false;
    let moved = false;
    let pointerX = 0;
    let pointerY = 0;
    let downX = 0;
    let downY = 0;
    let pinchDistance = 0;
    const activePointers = new Map<number, { x: number; y: number }>();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const makeModelMatrix = (part: ModelPart, pulse = 1) => {
      const rotation = part.rotation ?? [0, 0, 0];
      const translated = translation(...part.position);
      const rotated = multiply(multiply(rotationZ(rotation[2]), rotationY(rotation[1])), rotationX(rotation[0]));
      return multiply(multiply(translated, rotated), scaling(part.scale[0] * pulse, part.scale[1] * pulse, part.scale[2] * pulse));
    };

    const drawPart = (part: ModelPart, world: Mat4, projectionView: Mat4, color: Vec3, emphasis: number, pulse = 1) => {
      const worldModel = multiply(world, makeModelMatrix(part, pulse));
      gl.uniformMatrix4fv(projectionViewLocation, false, projectionView);
      gl.uniformMatrix4fv(worldModelLocation, false, worldModel);
      gl.uniform3fv(colorLocation, color);
      gl.uniform1f(emphasisLocation, emphasis);
      gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
    };

    const render = (time: number) => {
      resize();
      const { activeId: selectedId, playing: isPlaying } = propsRef.current;
      if (snapRef.current && !dragging) {
        let delta = targetYawRef.current - yawRef.current;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        yawRef.current += delta * 0.1;
        if (Math.abs(delta) < 0.002) snapRef.current = false;
      }
      const idle = isPlaying && !dragging && !reducedMotion ? Math.sin(time * 0.0007) * 0.055 : 0;
      const yaw = yawRef.current + idle;
      const world = multiply(rotationX(pitchRef.current), rotationY(yaw));
      const projection = perspective(Math.PI / 4.15, canvas.width / canvas.height, 0.1, 30);
      const viewMatrix = translation(0, 0.12, -zoomRef.current);
      const projectionView = multiply(projection, viewMatrix);

      gl.clearColor(0.02, 0.055, 0.046, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(normalLocation);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 24, 12);

      BASE_PARTS.forEach((part) => drawPart(part, world, projectionView, part.color ?? [0.42, 0.4, 0.37], 0));
      const hits: { id: string; x: number; y: number; depth: number }[] = [];
      MUSCLE_PARTS.forEach((part) => {
        const selected = part.id === selectedId;
        const pulse = selected && isPlaying && !reducedMotion ? 1 + Math.sin(time * 0.0044) * 0.045 : 1;
        const frontFacing = transformPoint(world, part.position)[2] > -0.02;
        const baseColor: Vec3 = selected ? [1, 0.27, 0.16] : frontFacing ? [0.72, 0.16, 0.12] : [0.42, 0.095, 0.085];
        drawPart(part, world, projectionView, baseColor, selected ? 1 : 0, pulse);

        if (part.id && frontFacing) {
          const clip = transformPoint(multiply(projectionView, world), part.position);
          if (clip[3] > 0) {
            const normalizedX = clip[0] / clip[3];
            const normalizedY = clip[1] / clip[3];
            hits.push({
              id: part.id,
              x: (normalizedX * 0.5 + 0.5) * canvas.clientWidth,
              y: (-normalizedY * 0.5 + 0.5) * canvas.clientHeight,
              depth: clip[2] / clip[3],
            });
          }
        }
      });
      hitPointsRef.current = hits;
      animationFrame = window.requestAnimationFrame(render);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = false;
      pointerX = event.clientX;
      pointerY = event.clientY;
      downX = event.clientX;
      downY = event.clientY;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (activePointers.size === 2) {
        const points = [...activePointers.values()];
        pinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        moved = true;
      }
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (activePointers.size >= 2) {
        const points = [...activePointers.values()];
        const nextDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        if (pinchDistance > 0) zoomRef.current = Math.max(5.8, Math.min(9.4, zoomRef.current - (nextDistance - pinchDistance) * 0.012));
        pinchDistance = nextDistance;
        moved = true;
        return;
      }
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 5) moved = true;
      yawRef.current += dx * 0.009;
      pitchRef.current = Math.max(-0.34, Math.min(0.28, pitchRef.current + dy * 0.005));
      pointerX = event.clientX;
      pointerY = event.clientY;
      snapRef.current = false;
    };
    const onPointerUp = (event: PointerEvent) => {
      const wasPinching = activePointers.size > 1;
      activePointers.delete(event.pointerId);
      dragging = activePointers.size > 0;
      if (activePointers.size < 2) pinchDistance = 0;
      if (!moved && !wasPinching) {
        const bounds = canvas.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const nearest = hitPointsRef.current
          .map((point) => ({ ...point, distance: Math.hypot(point.x - x, point.y - y) }))
          .filter((point) => point.distance < 44)
          .sort((a, b) => a.distance - b.distance || a.depth - b.depth)[0];
        if (nearest) propsRef.current.onSelect(nearest.id);
      }
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomRef.current = Math.max(5.8, Math.min(9.4, zoomRef.current + event.deltaY * 0.004));
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  const activeName = muscles.find((muscle) => muscle.id === activeId)?.name ?? "肌群";
  const resetView = () => {
    targetYawRef.current = view === "front" ? 0 : Math.PI;
    pitchRef.current = -0.04;
    zoomRef.current = 7.5;
    snapRef.current = true;
  };

  return (
    <div className="anatomy-3d">
      <canvas
        ref={canvasRef}
        className="anatomy-3d-canvas"
        role="img"
        aria-label={`可拖动旋转的 3D 人体肌肉模型，当前选择${activeName}`}
      />
      <div className="anatomy-3d-status" aria-live="polite">
        <span><i /> WEBGL 3D</span>
        <strong>{activeName}</strong>
      </div>
      <p className="anatomy-3d-help"><b>拖动</b>旋转 · <b>滚轮 / 双指</b>缩放 · <b>点按</b>选择肌群</p>
      <div className="anatomy-3d-controls" aria-label="3D 模型控制">
        <button type="button" onClick={() => { zoomRef.current = Math.min(9.4, zoomRef.current + 0.45); }} aria-label="缩小 3D 模型">−</button>
        <button type="button" onClick={resetView}>重置</button>
        <button type="button" onClick={() => { zoomRef.current = Math.max(5.8, zoomRef.current - 0.45); }} aria-label="放大 3D 模型">＋</button>
      </div>
    </div>
  );
}
