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
  model?: { materials: readonly ModelMaterial[] };
};

type Vector3D = { x: number; y: number; z: number; toString: () => string };
type CameraOrbit = { theta: number; phi: number; radius: number; toString: () => string };
type ModelHit = { position: Vector3D; normal: Vector3D };
type FocusMarker = { x: number; y: number; name: string };
type HotspotPosition = { id: string; position: string; normal: string };
type InteractionRegion = { id: string; view: BodyView; x: number; y: number; radiusX: number; radiusY: number };
type HotspotAnchor = { id: string; view: BodyView; x: number; y: number; depth?: number };
type ModelMaterial = {
  setAlphaMode: (mode: "OPAQUE" | "MASK" | "BLEND") => void;
  pbrMetallicRoughness: {
    readonly baseColorFactor: Readonly<[number, number, number, number]>;
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

const INTERACTION_REGIONS: InteractionRegion[] = [
  { id: "deltoid", view: "front", x: 0.43, y: 0.76, radiusX: 0.2, radiusY: 0.1 },
  { id: "chest", view: "front", x: 0.13, y: 0.68, radiusX: 0.22, radiusY: 0.09 },
  { id: "biceps", view: "front", x: 0.58, y: 0.62, radiusX: 0.2, radiusY: 0.1 },
  { id: "serratus-anterior", view: "front", x: 0.31, y: 0.59, radiusX: 0.14, radiusY: 0.09 },
  { id: "forearm", view: "front", x: 0.79, y: 0.49, radiusX: 0.21, radiusY: 0.16 },
  { id: "abs", view: "front", x: 0.08, y: 0.53, radiusX: 0.15, radiusY: 0.13 },
  { id: "obliques", view: "front", x: 0.28, y: 0.49, radiusX: 0.15, radiusY: 0.13 },
  { id: "adductors", view: "front", x: 0.13, y: 0.37, radiusX: 0.14, radiusY: 0.11 },
  { id: "quadriceps", view: "front", x: 0.24, y: 0.25, radiusX: 0.19, radiusY: 0.14 },
  { id: "tibialis", view: "front", x: 0.23, y: 0.09, radiusX: 0.18, radiusY: 0.13 },
  { id: "trapezius", view: "back", x: 0.1, y: 0.74, radiusX: 0.18, radiusY: 0.1 },
  { id: "rotator-cuff", view: "back", x: 0.39, y: 0.72, radiusX: 0.13, radiusY: 0.08 },
  { id: "infraspinatus", view: "back", x: 0.25, y: 0.68, radiusX: 0.12, radiusY: 0.07 },
  { id: "rhomboids", view: "back", x: 0.13, y: 0.63, radiusX: 0.13, radiusY: 0.08 },
  { id: "teres-major", view: "back", x: 0.35, y: 0.61, radiusX: 0.12, radiusY: 0.07 },
  { id: "triceps", view: "back", x: 0.59, y: 0.61, radiusX: 0.19, radiusY: 0.11 },
  { id: "lats", view: "back", x: 0.31, y: 0.52, radiusX: 0.2, radiusY: 0.13 },
  { id: "erectors", view: "back", x: 0.09, y: 0.47, radiusX: 0.13, radiusY: 0.15 },
  { id: "glutes", view: "back", x: 0.2, y: 0.37, radiusX: 0.19, radiusY: 0.12 },
  { id: "hamstrings", view: "back", x: 0.22, y: 0.24, radiusX: 0.19, radiusY: 0.14 },
  { id: "calves", view: "back", x: 0.22, y: 0.09, radiusX: 0.17, radiusY: 0.13 },
];

const HOTSPOT_ANCHORS: HotspotAnchor[] = [
  { id: "deltoid", view: "front", x: -0.43, y: 0.76 }, { id: "chest", view: "front", x: 0.13, y: 0.68 },
  { id: "biceps", view: "front", x: -0.58, y: 0.62 }, { id: "serratus-anterior", view: "front", x: 0.31, y: 0.59 },
  { id: "forearm", view: "front", x: -0.79, y: 0.49 }, { id: "abs", view: "front", x: 0.08, y: 0.53 },
  { id: "obliques", view: "front", x: -0.28, y: 0.49 }, { id: "adductors", view: "front", x: 0.13, y: 0.37 },
  { id: "quadriceps", view: "front", x: -0.24, y: 0.25 }, { id: "tibialis", view: "front", x: 0.23, y: 0.09 },
  { id: "trapezius", view: "back", x: -0.1, y: 0.74 }, { id: "rotator-cuff", view: "back", x: -0.39, y: 0.72 },
  { id: "infraspinatus", view: "back", x: 0.25, y: 0.68 }, { id: "rhomboids", view: "back", x: -0.13, y: 0.63 },
  { id: "teres-major", view: "back", x: 0.35, y: 0.61 }, { id: "triceps", view: "back", x: -0.59, y: 0.61 },
  { id: "lats", view: "back", x: 0.31, y: 0.52 }, { id: "erectors", view: "back", x: -0.09, y: 0.47 },
  { id: "glutes", view: "back", x: 0.2, y: 0.37 }, { id: "hamstrings", view: "back", x: -0.22, y: 0.24 },
  { id: "calves", view: "back", x: 0.22, y: 0.09 },
];

function solidifyMuscleMaterials(viewer: ModelViewerElement) {
  viewer.model?.materials.forEach((material) => {
    material.setAlphaMode("OPAQUE");
    material.pbrMetallicRoughness.setBaseColorFactor("#d94335");
    material.pbrMetallicRoughness.setMetallicFactor(0);
    material.pbrMetallicRoughness.setRoughnessFactor(0.72);
  });
}

function muscleAtPoint(muscles: MuscleOption[], pointView: BodyView, point: Vector3D, center: Vector3D, dimensions: Vector3D) {
  const height = Math.max(0, Math.min(1, (point.y - (center.y - dimensions.y / 2)) / dimensions.y));
  const side = Math.abs(point.x - center.x) / Math.max(dimensions.x / 2, 0.001);
  const availableIds = new Set(muscles.filter((muscle) => muscle.view === pointView).map((muscle) => muscle.id));
  let closest: { id: string; score: number } | null = null;

  INTERACTION_REGIONS.forEach((region) => {
    if (region.view !== pointView || !availableIds.has(region.id)) return;
    const score = ((side - region.x) / region.radiusX) ** 2 + ((height - region.y) / region.radiusY) ** 2;
    if (!closest || score < closest.score) closest = { id: region.id, score };
  });

  return closest && closest.score <= 3.2 ? closest.id : undefined;
}

function buildHotspotPositions(viewer: ModelViewerElement, muscles: MuscleOption[]) {
  const dimensions = viewer.getDimensions?.();
  const center = viewer.getBoundingBoxCenter?.();
  if (!dimensions || !center) return [];
  const availableIds = new Set(muscles.map((muscle) => muscle.id));

  return HOTSPOT_ANCHORS.filter((anchor) => availableIds.has(anchor.id)).map((anchor) => {
    const x = center.x + (dimensions.x / 2) * anchor.x;
    const y = center.y - dimensions.y / 2 + dimensions.y * anchor.y;
    const direction = anchor.view === "front" ? 1 : -1;
    const z = center.z + (dimensions.z / 2) * direction * (anchor.depth ?? 1.04);
    return { id: anchor.id, position: `${x}m ${y}m ${z}m`, normal: `0 0 ${direction}` };
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
  const [focusMarker, setFocusMarker] = useState<FocusMarker | null>(null);
  const [hotspotPositions, setHotspotPositions] = useState<HotspotPosition[]>([]);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const markerTimerRef = useRef<number | null>(null);
  const previousActiveIdRef = useRef(activeId);
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
      solidifyMuscleMaterials(viewer);
      setHotspotPositions(buildHotspotPositions(viewer, muscles));
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
  }, [muscles, viewerElement, viewerReady]);

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

  const selectHotspot = useCallback((muscleId: string, position: string) => {
    const muscle = muscles.find((item) => item.id === muscleId);
    const viewer = viewerElement;
    if (!muscle || !viewer) return;
    const nextZoom = FOCUS_PROFILES[muscleId]?.zoom ?? 42;
    onSelect(muscleId);
    setFocusedId(muscleId);
    setFocusMarker(null);
    setZoom(nextZoom);
    viewer.setAttribute("camera-target", position);
    viewer.setAttribute("camera-orbit", `${muscle.view === "front" ? 0 : 180}deg 78deg ${nextZoom}%`);
    viewer.setAttribute("field-of-view", "28deg");
  }, [muscles, onSelect, viewerElement]);

  const hotspotButtons = hotspotPositions.filter((hotspot) => muscles.find((muscle) => muscle.id === hotspot.id)?.view === view).map((hotspot) => {
    const muscle = muscles.find((item) => item.id === hotspot.id);
    if (!muscle) return null;
    return createElement("button", {
      key: hotspot.id,
      type: "button",
      slot: `hotspot-${hotspot.id}`,
      className: "anatomy-hotspot-3d",
      "data-position": hotspot.position,
      "data-normal": hotspot.normal,
      "data-visibility-attribute": "visible",
      "data-active": activeId === hotspot.id ? "true" : "false",
      "data-label": muscle.name,
      "aria-label": `查看${muscle.name}`,
      onPointerDown: (event) => event.stopPropagation(),
      onPointerUp: (event) => event.stopPropagation(),
      onClick: (event) => {
        event.stopPropagation();
        selectHotspot(hotspot.id, hotspot.position);
      },
    }, createElement("span", { "aria-hidden": "true" }));
  });

  const model = createElement("model-viewer", {
    ref: captureViewer,
    className: "anatomy-model-viewer",
    src: "/models/muscular.glb",
    alt: `可旋转的写实人体肌肉 3D 模型，当前选择${activeMuscle.name}`,
    "camera-controls": "",
    "touch-action": "pan-y",
    "interaction-prompt": "none",
    "rotation-per-second": "7deg",
    "shadow-intensity": "0.94",
    "shadow-softness": "0.86",
    exposure: "0.92",
    "environment-image": "neutral",
    "camera-orbit": `${azimuth}deg 78deg ${zoom}%`,
    "min-camera-orbit": "auto 58deg 34%",
    "max-camera-orbit": "auto 100deg 150%",
    "field-of-view": "26deg",
    "interpolation-decay": "120",
    loading: "eager",
    reveal: "auto",
  }, ...hotspotButtons);

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

      <p className="anatomy-3d-help"><b>红点可精确选择</b> · 点按肌肉局部放大 · <b>拖动</b>旋转</p>
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
