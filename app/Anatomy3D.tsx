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
    setBaseColorFactor: (rgba: [number, number, number, number] | string) => void;
    setMetallicFactor: (value: number) => void;
    setRoughnessFactor: (value: number) => void;
  };
};

type ProgressEvent = Event & {
  detail?: { totalProgress?: number };
};

const MODEL_VIEWER_SCRIPT = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";

const FOCUS_PROFILES: Record<string, { y: number; zoom: number }> = {
  deltoid: { y: 0.77, zoom: 46 }, chest: { y: 0.68, zoom: 43 }, biceps: { y: 0.62, zoom: 43 }, forearm: { y: 0.49, zoom: 42 },
  "serratus-anterior": { y: 0.6, zoom: 42 }, abs: { y: 0.52, zoom: 43 }, obliques: { y: 0.51, zoom: 43 }, adductors: { y: 0.36, zoom: 45 }, quadriceps: { y: 0.27, zoom: 43 }, tibialis: { y: 0.1, zoom: 42 },
  trapezius: { y: 0.73, zoom: 44 }, "rotator-cuff": { y: 0.72, zoom: 43 }, infraspinatus: { y: 0.68, zoom: 40 }, rhomboids: { y: 0.63, zoom: 40 }, "teres-major": { y: 0.61, zoom: 41 }, triceps: { y: 0.62, zoom: 43 }, lats: { y: 0.56, zoom: 44 },
  erectors: { y: 0.5, zoom: 44 }, glutes: { y: 0.39, zoom: 44 }, hamstrings: { y: 0.25, zoom: 43 }, calves: { y: 0.1, zoom: 42 },
};

function solidifyMuscleMaterials(viewer: ModelViewerElement) {
  viewer.model?.materials.forEach((material) => {
    material.setAlphaMode("OPAQUE");
    material.pbrMetallicRoughness.setBaseColorFactor("#c24a3e");
    material.pbrMetallicRoughness.setMetallicFactor(0);
    material.pbrMetallicRoughness.setRoughnessFactor(0.8);
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
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const previousActiveIdRef = useRef(activeId);
  const activeMuscle = muscles.find((muscle) => muscle.id === activeId) ?? muscles[0];
  const viewMuscles = muscles.filter((muscle) => muscle.view === view);
  const azimuth = view === "front" ? 0 : 180;
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
      solidifyMuscleMaterials(viewer);
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

    const targetY = center.y - dimensions.y / 2 + dimensions.y * profile.y;
    viewer.setAttribute("camera-target", `${center.x}m ${targetY}m ${center.z}m`);
    viewer.setAttribute("camera-orbit", `${muscle.view === "front" ? 0 : 180}deg 78deg ${profile.zoom}%`);
    viewer.setAttribute("field-of-view", "28deg");
    setZoom(profile.zoom);
    setFocusedId(muscleId);
  }, [modelReady, muscles, viewerElement]);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;
    viewer.setAttribute("camera-orbit", `${azimuth}deg 78deg ${zoom}%`);
  }, [azimuth, viewerElement, viewerReady, zoom]);

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
    setZoom(nextZoom);
    setFocusedId(null);
    const viewer = viewerElement;
    if (!viewer) return;
    viewer.resetTurntableRotation?.();
    viewer.setAttribute("camera-target", "auto auto auto");
    viewer.setAttribute("camera-orbit", `${azimuth}deg 78deg ${nextZoom}%`);
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
    exposure: "0.96",
    "environment-image": "neutral",
    "camera-orbit": `${azimuth}deg 78deg ${zoom}%`,
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
        <span>MUSCULATURE · {view === "front" ? "ANTERIOR" : "POSTERIOR"}</span>
        <strong>{activeMuscle.name}</strong>
        {activeMuscle.english && <small>{activeMuscle.english}</small>}
      </div>

      <nav className="anatomy-directory" aria-label={`${view === "front" ? "正面" : "背面"}可选择肌群`}>
        <div><span>肌群目录</span><small>选择后精准定位</small></div>
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

      <p className="anatomy-3d-help"><b>从肌群目录精准定位</b><span>拖动旋转 · 双指缩放</span></p>

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
