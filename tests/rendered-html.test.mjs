import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the medical 3D muscle map", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>肌图 Muscle Map｜人体肌群互动学习<\/title>/i);
  assert.match(html, /MUSCULATURE ·/);
  assert.match(html, /肌群目录/);
  assert.match(html, /可旋转的写实人体肌肉 3D 模型/);
  assert.match(html, /动态动作演示/);
  assert.match(html, /21<\/strong><span>大肌群/);
  assert.match(html, /56<\/strong><span>精细结构/);
});

test("uses a licensed medical model with touch controls and a safe fallback", async () => {
  const [model, page, packageJson, vercelConfig] = await Promise.all([
    readFile(new URL("../app/Anatomy3D.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ]);

  assert.match(model, /model-viewer\/4\.3\.1/);
  assert.match(model, /camera-controls/);
  assert.match(model, /touch-action/);
  assert.match(model, /setAlphaMode\("OPAQUE"\)/);
  assert.match(model, /setBaseColorFactor\("#c24a3e"\)/);
  assert.match(model, /anatomy-directory/);
  assert.match(model, /选择后精准定位/);
  assert.match(model, /从肌群目录精准定位/);
  assert.doesNotMatch(model, /positionAndNormalFromPoint|INTERACTION_REGIONS|HOTSPOT_ANCHORS|anatomy-hotspot-3d|data-visibility-attribute/);
  assert.match(model, /camera-target/);
  assert.match(model, /全身/);
  assert.match(model, /BodyParts3D \/ Optima/);
  assert.match(model, /anterior-muscles\.jpg/);
  assert.match(page, /菱形肌/);
  assert.match(page, /冈下肌/);
  assert.match(page, /前锯肌/);
  assert.match(page, /大圆肌/);
  assert.match(page, /<Anatomy3D/);
  assert.doesNotMatch(page, /interactive-muscle-dot/);
  assert.match(vercelConfig, /models\/muscular\.glb/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
