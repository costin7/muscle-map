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

type ModelViewerElement = HTMLElement & {
  resetTurntableRotation?: () => void;
  getDimensions?: () => Vector3D;
  getBoundingBoxCenter?: () => Vector3D;
  getCameraOrbit?: () => CameraOrbit;
  positionAndNormalFromPoint?: (clientX: number, clientY: number) => ModelHit | null;
};

type Vector3D = { x: number; y: number; z: number; toString: () => string };
type CameraOrbit = { theta: number; phi: number; radius: number; toString: () => string };
type ModelHit = { position: Vector3D; normal: Vector3D };
type FocusMarker = { x: number; y: number; name: string };

type ProgressEvent = Event & {
  detail?: { totalProgress?: number };
};

const MODEL_VIEWER_SCRIPT = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";

const FOCUS_PROFILES: Record<string, { y: number; zoom: number }> = {
  deltoid: { y: 0.77, zoom: 46 }, chest: { y: 0.68, zoom: 43 }, biceps: { y: 0.62, zoom: 43 }, forearm: { y: 0.49, zoom: 42 },
  abs: { y: 0.52, zoom: 43 }, obliques: { y: 0.51, zoom: 43 }, adductors: { y: 0.36, zoom: 45 }, quadriceps: { y: 0.27, zoom: 43 }, tibialis: { y: 0.1, zoom: 42 },
  trapezius: { y: 0.73, zoom: 44 }, "rotator-cuff": { y: 0.72, zoom: 43 }, triceps: { y: 0.62, zoom: 43 }, lats: { y: 0.59, zoom: 44 },
  erectors: { y: 0.5, zoom: 44 }, glutes: { y: 0.39, zoom: 44 }, hamstrings: { y: 0.25, zoom: 43 }, calves: { y: 0.1, zoom: 42 },
};

function muscleAtPoint(muscles: MuscleOption[], pointView: BodyView, point: Vector3D, center: Vector3D, dimensions: Vector3D) {
  const height = Math.max(0, Math.min(1, (point.y - (center.y - dimensions.y / 2)) / dimensions.y));
  const side = Math.abs(point.x - center.x) / Math.max(dimensions.x / 2, 0.001);
  let id: string;

  if (pointView === "front") {
    if (height > 0.74) id = side > 0.26 ? "deltoid" : "chest";
    else if (height > 0.61) id = side > 0.5 ? "biceps" : "chest";
    else if (height > 0.45) id = side > 0.69 ? "forearm" : side > 0.25 ? "obliques" : "abs";
    else if (height > 0.31) id = "adductors";
    else if (height > 0.15) id = "quadriceps";
    else id = "tibialis";
  } else {
    if (height > 0.74) id = side > 0.3 ? "rotator-cuff" : "trapezius";
    else if (height > 0.61) id = side > 0.56 ? "triceps" : side > 0.25 ? "lats" : "trapezius";
    else if (height > 0.45) id = side > 0.35 ? "lats" : "erectors";
    else if (height > 0.31) id = "glutes";
    else if (height > 0.15) id = "hamstrings";
    else id = "calves";
  }

  return muscles.find((muscle) => muscle.id === id)?.id ?? muscles.find((muscle) => muscle.view === pointView)?.id ?? muscles[0]?.id;
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
  const [focusMarker, setFocusMarker] = useState<FocusMarker | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const markerTimerRef = useRef<number | null>(null);
  const previousActiveIdRef = useRef(activeId);
  const modelSelectionRef = useRef(false);
  const activeMuscle = muscles.find((muscle) => muscle.id === activeId) ?? muscles[0];
  const azimuth = view === "front" ? 0 : 180;
  const captureViewer = useCallback((node: ModelViewerElement | null) => setViewerElement(node), []);

  useEffect(() => installModelViewer(() => setViewerReady(true), () => setFailed(true)), []);

  useEffect(() => () => {
    if (markerTimerRef.current) window.clearTimeout(markerTimerRef.current);
  }, []);

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

  const focusMuscle = useCallback((muscleId: string) => {
    const viewer = viewerElement;
    const profile = FOCUS_PROFILES[muscleId];
    if (!viewer || !modelReady || !profile) return;
    const dimensions = viewer.getDimensions?.();
    const center = viewer.getBoundingBoxCenter?.();
    const muscle = muscles.find((item) => item.id === muscleId);
    if (!dimensions || !center || !muscle) return;

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
    const orbit = `${azimuth}deg 78deg ${zoom}%`;
    viewer.setAttribute("camera-orbit", orbit);
  }, [azimuth, viewerElement, zoom, viewerReady]);

  useEffect(() => {
    if (!modelReady || previousActiveIdRef.current === activeId) return;
    previousActiveIdRef.current = activeId;
    if (modelSelectionRef.current) {
      modelSelectionRef.current = false;
      return;
    }
    focusMuscle(activeId);
  }, [activeId, focusMuscle, modelReady]);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer) return;
    if (playing && !focusedId) viewer.setAttribute("auto-rotate", "");
    else viewer.removeAttribute("auto-rotate");
  }, [focusedId, playing, viewerElement, viewerReady]);

  useEffect(() => {
    const viewer = viewerElement;
    if (!viewer || !modelReady) return;

    const handlePointerDown = (event: PointerEvent) => {
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;

      const hit = viewer.positionAndNormalFromPoint?.(event.clientX, event.clientY);
      const dimensions = viewer.getDimensions?.();
      const center = viewer.getBoundingBoxCenter?.();
      if (!hit || !dimensions || !center) return;

      const orbit = viewer.getCameraOrbit?.();
      const theta = orbit?.theta ?? (view === "front" ? 0 : Math.PI);
      const normalizedTheta = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const pointView: BodyView = normalizedTheta > Math.PI / 2 && normalizedTheta < Math.PI * 1.5 ? "back" : "front";
      const nextId = muscleAtPoint(muscles, pointView, hit.position, center, dimensions);
      const nextMuscle = muscles.find((muscle) => muscle.id === nextId);
      if (!nextId || !nextMuscle) return;

      const nextZoom = FOCUS_PROFILES[nextId]?.zoom ?? 44;
      modelSelectionRef.current = nextId !== activeId;
      onSelect(nextId);
      setFocusedId(nextId);
      setZoom(nextZoom);
      viewer.setAttribute("camera-target", hit.position.toString());
      viewer.setAttribute("camera-orbit", `${pointView === "front" ? 0 : 180}deg 78deg ${nextZoom}%`);
      viewer.setAttribute("field-of-view", "28deg");

      const bounds = viewer.getBoundingClientRect();
      setFocusMarker({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, name: nextMuscle.name });
      if (markerTimerRef.current) window.clearTimeout(markerTimerRef.current);
      markerTimerRef.current = window.setTimeout(() => setFocusMarker(null), 1500);
    };

    viewer.addEventListener("pointerdown", handlePointerDown);
    viewer.addEventListener("pointerup", handlePointerUp);
    return () => {
      viewer.removeEventListener("pointerdown", handlePointerDown);
      viewer.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeId, modelReady, muscles, onSelect, view, viewerElement]);

  const resetView = () => {
    const nextZoom = 105;
    setZoom(nextZoom);
    setFocusedId(null);
    setFocusMarker(null);
    const orbit = `${azimuth}deg 78deg ${nextZoom}%`;
    const viewer = viewerElement;
    if (viewer) {
      viewer.resetTurntableRotation?.();
      viewer.setAttribute("camera-target", "auto auto auto");
      viewer.setAttribute("camera-orbit", orbit);
      viewer.setAttribute("field-of-view", "26deg");
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

      {focusMarker && (
        <div className="anatomy-focus-marker" style={{ left: focusMarker.x, top: focusMarker.y }} aria-hidden="true">
          <i /><span>{focusMarker.name}</span>
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
          <p><strong>3D 模型暂时没有加载成功</strong><span>当前已切换到高清解剖图，仍可从下方选择肌群继续学习。</span></p>
        </div>
      )}

      <div className="anatomy-3d-status" aria-live="polite">
        <span><i /> REAL ANATOMY · 3D</span>
        <strong>{activeMuscle.name}</strong>
        {activeMuscle.english && <small>{activeMuscle.english}</small>}
      </div>

      <div className="anatomy-axis" aria-hidden="true"><span>SUPERIOR</span><i /><span>INFERIOR</span></div>

      <p className="anatomy-3d-help"><b>点按肌肉</b>局部放大 · <b>拖动</b>旋转 · <b>双指</b>缩放</p>
      {focusedId && (
        <button className="anatomy-focus-chip" type="button" onClick={resetView}>
          <span aria-hidden="true">⌖</span> 正在观察 {activeMuscle.name} <b>返回全身</b>
        </button>
      )}
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
