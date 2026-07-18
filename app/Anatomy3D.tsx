"use client";

import { createElement, useCallback, useEffect, useState } from "react";

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

type ModelViewerElement = HTMLElement & {
  resetTurntableRotation?: () => void;
};

type ProgressEvent = Event & {
  detail?: { totalProgress?: number };
};

const MODEL_VIEWER_SCRIPT = "https://unpkg.com/@google/model-viewer@4.2.0/dist/model-viewer.min.js";

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

export default function Anatomy3D({ view, activeId, muscles, playing }: Anatomy3DProps) {
  const [viewerElement, setViewerElement] = useState<ModelViewerElement | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(105);
  const activeMuscle = muscles.find((muscle) => muscle.id === activeId) ?? muscles[0];
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

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;
    const orbit = `${azimuth}deg 78deg ${zoom}%`;
    viewer.setAttribute("camera-orbit", orbit);
  }, [azimuth, viewerElement, zoom, viewerReady]);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;
    if (playing) viewer.setAttribute("auto-rotate", "");
    else viewer.removeAttribute("auto-rotate");
  }, [playing, viewerElement, viewerReady]);

  const resetView = () => {
    const nextZoom = 105;
    setZoom(nextZoom);
    const orbit = `${azimuth}deg 78deg ${nextZoom}%`;
    const viewer = viewerElement;
    if (viewer) {
      viewer.resetTurntableRotation?.();
      viewer.setAttribute("camera-orbit", orbit);
    }
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
    exposure: "1.08",
    "environment-image": "neutral",
    "camera-orbit": `${azimuth}deg 78deg ${zoom}%`,
    "min-camera-orbit": "auto 58deg 72%",
    "max-camera-orbit": "auto 100deg 150%",
    "field-of-view": "26deg",
    loading: "eager",
    reveal: "auto",
  });

  return (
    <div className="anatomy-3d" data-ready={modelReady ? "true" : "false"}>
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
          <p><strong>3D 模型暂时没有加载成功</strong><span>当前已切换到高清解剖图，仍可从下方选择肌群继续学习。</span></p>
        </div>
      )}

      <div className="anatomy-3d-status" aria-live="polite">
        <span><i /> REAL ANATOMY · 3D</span>
        <strong>{activeMuscle.name}</strong>
        {activeMuscle.english && <small>{activeMuscle.english}</small>}
      </div>

      <div className="anatomy-axis" aria-hidden="true"><span>SUPERIOR</span><i /><span>INFERIOR</span></div>

      <p className="anatomy-3d-help"><b>拖动</b>旋转 · <b>滚轮 / 双指</b>缩放 · 从下方选择肌群</p>
      <div className="anatomy-3d-controls" aria-label="3D 模型控制">
        <button type="button" onClick={() => setZoom((value) => Math.min(150, value + 10))} aria-label="缩小 3D 模型">−</button>
        <button type="button" onClick={resetView}>复位</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(72, value - 10))} aria-label="放大 3D 模型">＋</button>
      </div>

      <p className="anatomy-license">
        3D geometry · <a href="https://www.adamasdesigns.com/licenses" target="_blank" rel="noreferrer">BodyParts3D / Optima</a>
        <span>CC BY-SA 4.0</span>
      </p>
    </div>
  );
}
