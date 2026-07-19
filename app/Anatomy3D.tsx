"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { findMeshMatch, readableMeshName } from "./anatomyMatches";

type BodyView = "front" | "back";

type MuscleOption = {
  id: string;
  name: string;
  english?: string;
  view: BodyView;
};

type Anatomy3DProps = {
  view: BodyView;
  activeId: string;
  activePartId?: string;
  muscles: MuscleOption[];
  onSelect: (id: string, partId?: string) => void;
};

type BabylonVector = { x: number; y: number; z: number };

type BabylonMesh = {
  id: string;
  name: string;
  isPickable: boolean;
  isVisible: boolean;
  computeWorldMatrix: (force?: boolean) => unknown;
  getTotalVertices: () => number;
  getBoundingInfo: () => {
    boundingBox: {
      minimumWorld: BabylonVector;
      maximumWorld: BabylonVector;
    };
  };
};

type BabylonScene = {
  clearColor: unknown;
  pointerX: number;
  pointerY: number;
  activeCamera?: BabylonCamera;
  render: () => void;
  pick: (x: number, y: number) => { hit: boolean; pickedMesh?: BabylonMesh } | null;
  dispose: () => void;
};

type BabylonEngine = {
  runRenderLoop: (callback: () => void) => void;
  resize: () => void;
  dispose: () => void;
};

type BabylonCamera = {
  alpha: number;
  beta: number;
  radius: number;
  target: unknown;
  lowerRadiusLimit: number;
  upperRadiusLimit: number;
  wheelPrecision: number;
  pinchPrecision: number;
  panningSensibility: number;
  inertia: number;
  useBouncingBehavior: boolean;
  attachControl: (canvas: HTMLCanvasElement, noPreventDefault?: boolean) => void;
};

type BabylonHighlightLayer = {
  blurHorizontalSize: number;
  blurVerticalSize: number;
  innerGlow: boolean;
  outerGlow: boolean;
  addMesh: (mesh: BabylonMesh, color: unknown) => void;
  removeMesh: (mesh: BabylonMesh) => void;
  dispose: () => void;
};

type BabylonNamespace = {
  Engine: new (canvas: HTMLCanvasElement, antialias: boolean, options?: Record<string, unknown>, adaptToDeviceRatio?: boolean) => BabylonEngine;
  Scene: new (engine: BabylonEngine) => BabylonScene;
  Color3: new (r: number, g: number, b: number) => unknown;
  Color4: new (r: number, g: number, b: number, a: number) => unknown;
  Vector3: (new (x: number, y: number, z: number) => unknown) & { Zero: () => unknown };
  ArcRotateCamera: new (name: string, alpha: number, beta: number, radius: number, target: unknown, scene: BabylonScene) => BabylonCamera;
  HemisphericLight: new (name: string, direction: unknown, scene: BabylonScene) => { intensity: number; groundColor: unknown };
  DirectionalLight: new (name: string, direction: unknown, scene: BabylonScene) => { intensity: number; position: unknown };
  HighlightLayer: new (name: string, scene: BabylonScene, options?: Record<string, unknown>) => BabylonHighlightLayer;
  SceneLoader: {
    ImportMeshAsync: (
      meshNames: string,
      rootUrl: string,
      sceneFilename: string,
      scene: BabylonScene,
      onProgress?: (event: { lengthComputable?: boolean; loaded?: number; total?: number }) => void,
    ) => Promise<{ meshes: BabylonMesh[] }>;
  };
};

declare global {
  interface Window {
    BABYLON?: BabylonNamespace;
  }
}

const BABYLON_SCRIPT = "https://cdn.babylonjs.com/babylon.js";
const BABYLON_LOADERS_SCRIPT = "https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js";

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.ready === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    const handleLoad = () => {
      script.dataset.ready = "true";
      resolve();
    };
    const handleError = () => reject(new Error(`Unable to load ${src}`));
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existing) {
      script.id = id;
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

async function installBabylon() {
  if (!window.BABYLON) await loadScript("muscle-map-babylon", BABYLON_SCRIPT);
  await loadScript("muscle-map-babylon-loaders", BABYLON_LOADERS_SCRIPT);
  if (!window.BABYLON) throw new Error("Babylon renderer unavailable");
}

function meshBounds(meshes: BabylonMesh[]) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  meshes.forEach((mesh) => {
    if (mesh.getTotalVertices() <= 0) return;
    mesh.computeWorldMatrix(true);
    const { minimumWorld: min, maximumWorld: max } = mesh.getBoundingInfo().boundingBox;
    minX = Math.min(minX, min.x);
    minY = Math.min(minY, min.y);
    minZ = Math.min(minZ, min.z);
    maxX = Math.max(maxX, max.x);
    maxY = Math.max(maxY, max.y);
    maxZ = Math.max(maxZ, max.z);
  });

  if (![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite)) return null;
  return {
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 },
    diagonal: Math.hypot(maxX - minX, maxY - minY, maxZ - minZ),
  };
}

export default function Anatomy3D({ view, activeId, activePartId, muscles, onSelect }: Anatomy3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<BabylonScene | null>(null);
  const highlightRef = useRef<BabylonHighlightLayer | null>(null);
  const meshesRef = useRef<BabylonMesh[]>([]);
  const highlightedMeshesRef = useRef<BabylonMesh[]>([]);
  const validIdsRef = useRef(new Set(muscles.map((muscle) => muscle.id)));
  const onSelectRef = useRef(onSelect);
  const activeIdRef = useRef(activeId);
  const activePartIdRef = useRef(activePartId);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [rendererReady, setRendererReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clickedName, setClickedName] = useState("");
  const [clickMessage, setClickMessage] = useState("点击模型上的任意肌肉，直接识别真实网格");
  const activeMuscle = muscles.find((muscle) => muscle.id === activeId) ?? muscles[0];
  const viewMuscles = muscles.filter((muscle) => muscle.view === view);

  useEffect(() => {
    validIdsRef.current = new Set(muscles.map((muscle) => muscle.id));
    onSelectRef.current = onSelect;
    activeIdRef.current = activeId;
    activePartIdRef.current = activePartId;
  }, [activeId, activePartId, muscles, onSelect]);

  const clearHighlights = useCallback(() => {
    const layer = highlightRef.current;
    if (!layer) return;
    highlightedMeshesRef.current.forEach((mesh) => layer.removeMesh(mesh));
    highlightedMeshesRef.current = [];
  }, []);

  const highlightMeshes = useCallback((meshes: BabylonMesh[]) => {
    const layer = highlightRef.current;
    const BABYLON = window.BABYLON;
    if (!layer || !BABYLON) return;
    clearHighlights();
    const color = new BABYLON.Color3(1, 0.27, 0.08);
    meshes.forEach((mesh) => layer.addMesh(mesh, color));
    highlightedMeshesRef.current = meshes;
  }, [clearHighlights]);

  const highlightMuscle = useCallback((muscleId: string, partId?: string) => {
    const matches = meshesRef.current.filter((mesh) => {
      const match = findMeshMatch(mesh.name, validIdsRef.current);
      return match?.muscleId === muscleId && (!partId || match.partId === partId);
    });
    if (matches.length) highlightMeshes(matches);
    else clearHighlights();
    return matches.length;
  }, [clearHighlights, highlightMeshes]);

  useEffect(() => {
    let disposed = false;
    installBabylon()
      .then(() => {
        if (!disposed) setRendererReady(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const BABYLON = window.BABYLON;
    if (!rendererReady || !canvas || !BABYLON) return;

    let disposed = false;
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, premultipliedAlpha: false }, true);
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0.953, 0.945, 0.925, 1);

    const camera = new BABYLON.ArcRotateCamera("anatomy-camera", Math.PI / 2, Math.PI / 2.12, 3, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 32;
    camera.pinchPrecision = 75;
    camera.panningSensibility = 0;
    camera.inertia = 0.78;
    camera.useBouncingBehavior = true;
    scene.activeCamera = camera;

    const skyLight = new BABYLON.HemisphericLight("anatomy-sky", new BABYLON.Vector3(0.1, 1, -0.25), scene);
    skyLight.intensity = 1.16;
    skyLight.groundColor = new BABYLON.Color3(0.34, 0.29, 0.27);
    const keyLight = new BABYLON.DirectionalLight("anatomy-key", new BABYLON.Vector3(-0.6, -1, 0.72), scene);
    keyLight.position = new BABYLON.Vector3(2.5, 5, -4);
    keyLight.intensity = 1.05;

    const highlight = new BABYLON.HighlightLayer("anatomy-highlight", scene, { blurHorizontalSize: 1.2, blurVerticalSize: 1.2 });
    highlight.blurHorizontalSize = 1.3;
    highlight.blurVerticalSize = 1.3;
    highlight.innerGlow = true;
    highlight.outerGlow = true;
    highlightRef.current = highlight;

    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(canvas);
    engine.runRenderLoop(() => scene.render());

    BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "muscular.glb", scene, (event) => {
      if (disposed || !event.lengthComputable || !event.total) return;
      setProgress(Math.min(99, Math.round(((event.loaded ?? 0) / event.total) * 100)));
    })
      .then(({ meshes }) => {
        if (disposed) return;
        const pickableMeshes = meshes.filter((mesh) => mesh.getTotalVertices() > 0);
        pickableMeshes.forEach((mesh) => {
          mesh.isPickable = true;
        });
        meshesRef.current = pickableMeshes;
        const bounds = meshBounds(pickableMeshes);
        if (bounds) {
          camera.target = new BABYLON.Vector3(bounds.center.x, bounds.center.y, bounds.center.z);
          camera.radius = Math.max(bounds.diagonal * 0.72, 0.1);
          camera.lowerRadiusLimit = Math.max(bounds.diagonal * 0.22, 0.03);
          camera.upperRadiusLimit = Math.max(bounds.diagonal * 2.2, 0.5);
        }
        setProgress(100);
        setModelReady(true);
        setFailed(false);
        const selectedCount = highlightMuscle(activeIdRef.current, activePartIdRef.current);
        if (!selectedCount) setClickMessage("模型已就绪；点击任意肌肉可读取真实网格名称");
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      clearHighlights();
      meshesRef.current = [];
      highlight.dispose();
      highlightRef.current = null;
      scene.dispose();
      sceneRef.current = null;
      engine.dispose();
    };
  }, [clearHighlights, highlightMuscle, rendererReady]);

  useEffect(() => {
    if (!modelReady) return;
    highlightMuscle(activeId, activePartId);
  }, [activeId, activePartId, highlightMuscle, modelReady]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7) return;

    const scene = sceneRef.current;
    if (!scene) return;
    const result = scene.pick(scene.pointerX, scene.pointerY);
    const mesh = result?.hit ? result.pickedMesh : undefined;
    if (!mesh) return;

    const match = findMeshMatch(mesh.name, validIdsRef.current);
    if (match) {
      highlightMeshes([mesh]);
      setClickedName(`${match.english} · ${readableMeshName(mesh.name)}`);
      setClickMessage(`已精准命中 ${match.name}`);
      onSelectRef.current(match.muscleId, match.partId ?? "");
    } else {
      highlightMeshes([mesh]);
      setClickedName(readableMeshName(mesh.name));
      setClickMessage("已识别模型结构；它不属于独立健身肌肉条目，不做错误归类");
    }
  };

  const selectFromDirectory = (muscleId: string) => {
    setClickedName("");
    const count = highlightMuscle(muscleId);
    setClickMessage(count ? "已按模型中的真实网格名称高亮" : "资料已切换；点击模型表面可识别真实结构");
    onSelect(muscleId);
  };

  return (
    <div className="anatomy-3d" data-ready={modelReady ? "true" : "false"}>
      {!failed && (
        <canvas
          ref={canvasRef}
          className="babylon-anatomy-canvas"
          aria-label="可点击并精准识别肌肉网格的轻量人体解剖 3D 模型"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />
      )}

      {!modelReady && !failed && (
        <div className="anatomy-loading" role="status" aria-live="polite">
          <div className="anatomy-loading-mark" aria-hidden="true"><i /><i /><i /></div>
          <strong>{rendererReady ? "正在加载轻量分件肌肉模型" : "正在启动精准 3D 引擎"}</strong>
          <span>{progress ? `${progress}%` : "每块网格会独立响应点击"}</span>
          <b><i style={progress ? { width: `${Math.max(progress, 4)}%`, animation: "none", transform: "none" } : undefined} /></b>
        </div>
      )}

      {failed && (
        <div className="anatomy-fallback" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={view === "front" ? "/anterior-muscles.jpg" : "/posterior-muscles.jpg"} alt={`${view === "front" ? "正面" : "背面"}人体肌肉解剖图`} />
          <p><strong>分件 3D 模型暂时没有加载成功</strong><span>当前已切换到高清解剖图，仍可从肌群目录继续学习。</span></p>
        </div>
      )}

      <div className="anatomy-3d-heading" aria-live="polite">
        <span>MUSCULATURE · TRUE MESH PICKING</span>
        <strong>{activeMuscle.name}</strong>
        {activeMuscle.english && <small>{activeMuscle.english} · {view === "front" ? "正面资料" : "背面资料"}</small>}
      </div>

      <nav className="anatomy-directory" aria-label={`${view === "front" ? "正面" : "背面"}肌群资料目录`}>
        <div><span>肌群目录</span><small>真实网格高亮</small></div>
        <ol>
          {viewMuscles.map((muscle, index) => (
            <li key={muscle.id}>
              <button type="button" className={activeId === muscle.id ? "active" : ""} aria-current={activeId === muscle.id ? "true" : undefined} onClick={() => selectFromDirectory(muscle.id)}>
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                <b>{muscle.name}</b>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <p className="anatomy-click-feedback" aria-live="polite">
        <i aria-hidden="true" />
        <span><b>{clickMessage}</b>{clickedName && <small>{clickedName}</small>}</span>
      </p>

      <p className="anatomy-3d-help"><b>点击真实网格直接识别并高亮</b><span>拖动旋转 · 滚轮或双指缩放</span></p>

      <p className="anatomy-license">
        3D geometry · <a href="https://www.adamasdesigns.com/licenses" target="_blank" rel="noreferrer">BodyParts3D / Optima</a>
        <span>CC BY-SA 4.0</span>
      </p>
    </div>
  );
}
