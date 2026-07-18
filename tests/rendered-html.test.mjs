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

test("server-renders the interactive 3D muscle map", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>肌图 Muscle Map｜人体肌群互动学习<\/title>/i);
  assert.match(html, /WEBGL 3D/);
  assert.match(html, /可拖动旋转的 3D 人体肌肉模型/);
  assert.match(html, /动态动作演示/);
  assert.match(html, /51<\/strong><span>精细结构/);
});

test("keeps the 3D model self-contained and touch accessible", async () => {
  const [model, page, packageJson] = await Promise.all([
    readFile(new URL("../app/Anatomy3D.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(model, /getContext\("webgl"/);
  assert.match(model, /pointerdown/);
  assert.match(model, /wheel/);
  assert.match(model, /aria-label=\{`可拖动旋转的 3D/);
  assert.match(page, /<Anatomy3D/);
  assert.doesNotMatch(page, /anterior-muscles\.jpg|posterior-muscles\.jpg/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
