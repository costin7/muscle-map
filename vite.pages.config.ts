import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "muscle-map";

export default defineConfig({
  root: resolve(projectRoot, "github-pages"),
  base: `/${repositoryName}/`,
  publicDir: resolve(projectRoot, "public"),
  css: {
    postcss: projectRoot,
  },
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, "pages-dist"),
    emptyOutDir: true,
  },
});
