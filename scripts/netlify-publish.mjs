#!/usr/bin/env node
/**
 * Nitro (preset netlify) writes hashed client assets to dist/assets.
 * Some Netlify sites still have Publish directory = dist/client.
 * Copy public files + /assets into both places so CSS/JS load.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");
const assets = join(dist, "assets");
const publicDir = join(root, "public");

mkdirSync(client, { recursive: true });

if (existsSync(publicDir)) {
  cpSync(publicDir, dist, { recursive: true });
  cpSync(publicDir, client, { recursive: true });
}

if (existsSync(assets)) {
  cpSync(assets, join(client, "assets"), { recursive: true });
  console.log("[netlify-publish] copied dist/assets -> dist/client/assets");
} else {
  console.warn("[netlify-publish] dist/assets not found — client JS/CSS may 404");
}

console.log("[netlify-publish] publish dirs ready: dist and dist/client");
