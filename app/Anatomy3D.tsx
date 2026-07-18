"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";

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
  muscles: MuscleOption[];
  playing: boolean;
  onSelect: (id: string) => void;
};

type Vector3D = { x: number; y: number; z: number };

type ModelViewerElement = HTMLElement & {
  resetTurntableRotation?: () => void;
  getDimensions?: () => Vector3D;
  getBoundingBoxCenter?: () => Vector3D;
  model?: { materials: readonly ModelMaterial[] };
};

type ModelMaterial = {
  setAlphaMode: (mode: "OPAQUE" | "MASK" | "BLEND") => void;
  pbrMetallicRoughness: {
    setMetallicFactor: (value: number) => void;
    setRoughnessFactor: (value: number) => void;
  };
};

type FocusProfile = {
  y: number;
  x?: number;
  zoom: number;
  angle: number;
  effect: "shoulder" | "upper" | "torso" | "arm" | "hip" | "thigh" | "lower";
  perspective: "ANTERIOR" | "POSTERIOR" | "LATERAL" | "ANTEROLATERAL" | "POSTEROLATERAL";
};

type ProgressEvent = Event & {
  detail?: { totalProgress?: number };
};

const MODEL_VIEWER_SCRIPT = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";

const VIEW_AZIMUTH: Record<BodyView, number> = { front: 180, back: 0 };

const FOCUS_PROFILES: Record<string, FocusProfile> = {
  deltoid: { y: 0.77, x: 0.27, zoom: 40, angle: 105, effect: "shoulder", perspective: "LATERAL" },
  chest: { y: 0.68, zoom: 43, angle: 180, effect: "upper", perspective: "ANTERIOR" },
  biceps: { y: 0.62, x: 0.31, zoom: 41, angle: 145, effect: "arm", perspective: "ANTEROLATERAL" },
  forearm: { y: 0.49, x: 0.36, zoom: 40, angle: 145, effect: "arm", perspective: "ANTEROLATERAL" },
  "serratus-anterior": { y: 0.6, x: 0.2, zoom: 40, angle: 138, effect: "torso", perspective: "ANTEROLATERAL" },
  abs: { y: 0.52, zoom: 42, angle: 180, effect: "torso", perspective: "ANTERIOR" },
  obliques: { y: 0.51, x: 0.17, zoom: 41, angle: 142, effect: "torso", perspective: "ANTEROLATERAL" },
  adductors: { y: 0.36, x: 0.1, zoom: 43, angle: 170, effect: "thigh", perspective: "ANTERIOR" },
  quadriceps: { y: 0.27, x: 0.15, zoom: 41, angle: 165, effect: "thigh", perspective: "ANTERIOR" },
  tibialis: { y: 0.1, x: 0.16, zoom: 40, angle: 165, effect: "lower", perspective: "ANTERIOR" },
  trapezius: { y: 0.73, zoom: 43, angle: 0, effect: "upper", perspective: "POSTERIOR" },
  "rotator-cuff": { y: 0.72, x: 0.2, zoom: 40, angle: 38, effect: "shoulder", perspective: "POSTEROLATERAL" },
  infraspinatus: { y: 0.68, x: 0.15, zoom: 38, angle: 28, effect: "upper", perspective: "POSTEROLATERAL" },
  rhomboids: { y: 0.63, zoom: 39, angle: 0, effect: "upper", perspective: "POSTERIOR" },
  "teres-major": { y: 0.61, x: 0.21, zoom: 39, angle: 35, effect: "upper", perspective: "POSTEROLATERAL" },
  triceps: { y: 0.62, x: 0.31, zoom: 41, angle: 32, effect: "arm", perspective: "POSTEROLATERAL" },
  lats: { y: 0.56, x: 0.12, zoom: 42, angle: 18, effect: "torso", perspective: "POSTERIOR" },
  erectors: { y: 0.5, zoom: 42, angle: 0, effect: "torso", perspective: "POSTERIOR" },
  glutes: { y: 0.39, x: 0.12, zoom: 42, angle: 12, effect: "hip", perspective: "POSTERIOR" },
  hamstrings: { y: 0.25, x: 0.14, zoom: 41, angle: 12, effect: "thigh", perspective: "POSTERIOR" },
  calves: { y: 0.1, x: 0.15, zoom: 40, angle: 12, effect: "lower", perspective: "POSTERIOR" },
};

function restoreAnatomicalMaterials(viewer: ModelViewerElement) {
  viewer.model?.materials.forEach((material) => {
    material.setAlphaMode("OPAQUE");
    material.pbrMetallicRoughness.setMetallicFactor(0);
    material.pbrMetallicRoughness.setRoughnessFactor(0.66);
  });
}

function installModelViewer(onReady: () => void, onError: () => void) {
  if (customElements.get("model-viewer")) {
    onReady();
    return () => undefined;
  }

  const scriptId = "muscle-map-model-viewer";
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  const handleLoad = () => customElements.whenDefined("model-viewer").then(onReady).catch(onError);

  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "module";
    script.src = MODEL_VIEWER_SCRIPT;
    document.head.appendChild(script);
  }

  script.addEventListener("load", handleLoad);
  script.addEventListener("error", onError);
  if (customElements.get("model-viewer")) onReady();

  return () => {
    script?.removeEventListener("load", handleLoad);
    script?.removeEventListener("error", onError);
  };
}

export default function Anatomy3D({ view, activeId, muscles, playing, onSelect }: Anatomy3DProps) {
  const [viewerElement, setViewerElement] = useState<ModelViewerElement | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(105);
  const [cameraAngle, setCameraAngle] = useState(VIEW_AZIMUTH[view]);
  const [cameraPerspective, setCameraPerspective] = useState<FocusProfile["perspective"]>(view === "front" ? "ANTERIOR" : "POSTERIOR");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const previousActiveIdRef = useRef(activeId);
  const activeMuscle = muscles.find((muscle) => muscle.id === activeId) ?? muscles[0];
  const viewMuscles = muscles.filter((muscle) => muscle.view === view);
  const activeProfile = FOCUS_PROFILES[activeId];
  const displayPerspective = focusedId ? cameraPerspective : view === "front" ? "ANTERIOR" : "POSTERIOR";
  const captureViewer = useCallback((node: ModelViewerElement | null) => setViewerElement(node), []);

  useEffect(() => installModelViewer(() => setViewerReady(true), () => setFailed(true)), []);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;

    const handleProgress = (event: Event) => {
      const total = (event as ProgressEvent).detail?.totalProgress ?? 0;
      setProgress(Math.round(total * 100));
    };
    const handleLoad = () => {
      restoreAnatomicalMaterials(viewer);
      setModelReady(true);
      setFailed(false);
      setProgress(100);
    };
    const handleError = () => setFailed(true);

    viewer.addEventListener("progress", handleProgress);
    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);
    return () => {
      viewer.removeEventListener("progress", handleProgress);
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [viewerElement, viewerReady]);

  const focusMuscle = useCallback((muscleId: string) => {
    const viewer = viewerElement;
    const profile = FOCUS_PROFILES[muscleId];
    const muscle = muscles.find((item) => item.id === muscleId);
    if (!viewer || !modelReady || !profile || !muscle) return;

    const dimensions = viewer.getDimensions?.();
    const center = viewer.getBoundingBoxCenter?.();
    if (!dimensions || !center) return;

    const targetX = center.x + (dimensions.x / 2) * (profile.x ?? 0);
    const targetY = center.y - dimensions.y / 2 + dimensions.y * profile.y;
    viewer.setAttribute("camera-target", `${targetX}m ${targetY}m ${center.z}m`);
    viewer.setAttribute("field-of-view", "28deg");
    setCameraAngle(profile.angle);
    setCameraPerspective(profile.perspective);
    setZoom(profile.zoom);
    setFocusedId(muscleId);
  }, [modelReady, muscles, viewerElement]);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;
    viewer.setAttribute("camera-orbit", `${cameraAngle}deg 78deg ${zoom}%`);
  }, [cameraAngle, viewerElement, viewerReady, zoom]);

  useEffect(() => {
    if (!modelReady || previousActiveIdRef.current === activeId) return;
    previousActiveIdRef.current = activeId;
    focusMuscle(activeId);
  }, [activeId, focusMuscle, modelReady]);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;
    if (playing && !focusedId) viewer.setAttribute("auto-rotate", "");
    else viewer.removeAttribute("auto-rotate");
  }, [focusedId, playing, viewerElement, viewerReady]);

  const resetView = () => {
    const nextZoom = 105;
    const nextAngle = VIEW_AZIMUTH[view];
    setZoom(nextZoom);
    setCameraAngle(nextAngle);
    setCameraPerspective(view === "front" ? "ANTERIOR" : "POSTERIOR");
    setFocusedId(null);
    const viewer = viewerElement;
    if (!viewer) return;
    viewer.resetTurntableRotation?.();
    viewer.setAttribute("camera-target", "auto auto auto");
    viewer.setAttribute("camera-orbit", `${nextAngle}deg 78deg ${nextZoom}%`);
    viewer.setAttribute("field-of-view", "26deg");
  };

  const selectFromDirectory = (muscleId: string) => {
    if (muscleId === activeId) focusMuscle(muscleId);
    else onSelect(muscleId);
  };

  const model = createElement("model-viewer", {
    ref: captureViewer,
    className: "anatomy-model-viewer",
    src: "/models/muscular.glb",
    alt: `可旋转的写实人体肌肉 3D 模型，当前选择${activeMuscle.name}`,
    "camera-controls": "",
    "touch-action": "pan-y",
    "interaction-prompt": "none",
    "rotation-per-second": "7deg",
    "shadow-intensity": "0.72",
    "shadow-softness": "0.92",
    exposure: "1.04",
    "environment-image": "neutral",
    "tone-mapping": "commerce",
    "camera-orbit": `${cameraAngle}deg 78deg ${zoom}%`,
    "min-camera-orbit": "auto 58deg 34%",
    "max-camera-orbit": "auto 100deg 150%",
    "field-of-view": "26deg",
    "interpolation-decay": "120",
    loading: "eager",
    reveal: "auto",
  });

  return (
    <div className="anatomy-3d" data-ready={modelReady ? "true" : "false"} data-focused={focusedId ? "true" : "false"}>
      {!failed && model}

      {modelReady && focusedId && activeProfile && (
        <div className={`anatomy-selection-effect anatomy-selection-${activeProfile.effect}`} aria-hidden="true">
          <i /><i /><span />
        </div>
      )}

      {!modelReady && !failed && (
        <div className="anatomy-loading" role="status" aria-live="polite">
          <div className="anatomy-loading-mark" aria-hidden="true"><i /><i /><i /></div>
          <strong>{viewerReady ? "正在加载医学模型" : "正在启动 3D 查看器"}</strong>
          <span>{Math.max(progress, viewerReady ? 4 : 1)}%</span>
          <b><i style={{ width: `${Math.max(progress, viewerReady ? 4 : 1)}%` }} /></b>
        </div>
      )}

      {failed && (
        <div className="anatomy-fallback" role="status">
          {/* Vite 与 Next 共用此组件，保留原生图片作为跨运行时的可靠降级。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={view === "front" ? "/anterior-muscles.jpg" : "/posterior-muscles.jpg"} alt={`${view === "front" ? "正面" : "背面"}人体肌肉解剖图`} />
          <p><strong>3D 模型暂时没有加载成功</strong><span>当前已切换到高清解剖图，仍可从肌群目录继续学习。</span></p>
        </div>
      )}

      <div className="anatomy-3d-heading" aria-live="polite">
        <span>MUSCULATURE · {displayPerspective}</span>
        <strong>{activeMuscle.name}</strong>
        {activeMuscle.english && <small>{activeMuscle.english} · {displayPerspective === "LATERAL" ? "侧面视角" : displayPerspective.includes("LATERAL") ? "斜侧视角" : view === "front" ? "正面视角" : "背面视角"}</small>}
      </div>

      <nav className="anatomy-directory" aria-label={`${view === "front" ? "正面" : "背面"}可选择肌群`}>
        <div><span>肌群目录</span><small>自动切换解剖视角</small></div>
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

      <p className="anatomy-3d-help"><b>选择肌群后自动定位与高亮</b><span>拖动旋转 · 双指缩放</span></p>

      <div className="anatomy-3d-controls" aria-label="3D 模型控制">
        <button type="button" onClick={() => setZoom((value) => Math.min(150, value + 10))} aria-label="缩小 3D 模型">−</button>
        <button type="button" onClick={resetView}>{focusedId ? "全身" : "复位"}</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(34, value - 10))} aria-label="放大 3D 模型">＋</button>
      </div>

      <p className="anatomy-license">
        3D geometry · <a href="https://www.adamasdesigns.com/licenses" target="_blank" rel="noreferrer">BodyParts3D / Optima</a>
        <span>CC BY-SA 4.0</span>
      </p>
    </div>
  );
}
