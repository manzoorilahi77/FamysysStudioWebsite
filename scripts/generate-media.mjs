#!/usr/bin/env node
// Generates every placeholder image referenced by
// src/infrastructure/content/static/*.content.ts, entirely locally.
//
// Nothing is downloaded — images are hand-built SVG strings (no stock assets).
// Every color used is one of the locked design tokens from
// docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md.
//
// Deterministic by construction: no Math.random, no Date.now, no external
// input. Re-running against a non-empty public/media/ overwrites every file
// with byte-identical SVGs. No external tooling required.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, "..", "public", "media");

// ---------------------------------------------------------------------------
// Palette — the locked token set. Nothing outside this list.
// ---------------------------------------------------------------------------

const COLOR = {
  canvas: "#F4F1E8",
  ink: "#0B2C4D",
  accent: "#1C50FF",
  accentOnDark: "#7995F5",
  ink40: "#0B2C4D66",
  ink60: "#0B2C4D99",
  ink70: "#0B2C4DB3",
  canvas40: "#F4F1E866",
  canvas60: "#F4F1E899",
};

// ---------------------------------------------------------------------------
// Image plates — 6 reusable field/shape/color combinations, cycled across
// every placeholder image so the set reads as one deliberate system, not
// six one-offs and not one repeated tile.
// ---------------------------------------------------------------------------

const PLATES = [
  { field: "canvas", shape: "circle", shapeColor: COLOR.accent, fill: true },
  { field: "canvas", shape: "triangle", shapeColor: COLOR.ink60, fill: true },
  { field: "ink", shape: "circle", shapeColor: COLOR.accentOnDark, fill: true },
  { field: "canvas", shape: "diamond", shapeColor: COLOR.ink40, fill: true },
  { field: "ink", shape: "ring", shapeColor: COLOR.canvas40, fill: false },
  { field: "canvas", shape: "ring", shapeColor: COLOR.accent, fill: false },
];

const ASPECT_SIZE = {
  "16:9": [1200, 675],
  "4:3": [1200, 900],
  "1:1": [900, 900],
  "3:4": [900, 1200],
};

// Fidelity-loop pass 1, gap #1: mixed aspect ratios for the hero mosaic tiles, so its
// staggered columns don't read as one repeated tile size.
const MOSAIC_ASPECT_RATIOS = ["3:4", "1:1", "4:3", "1:1", "3:4", "4:3", "1:1", "3:4"];

function shapePath(shape, cx, cy, r) {
  switch (shape) {
    case "circle":
    case "ring":
      return { tag: "circle", attrs: `cx="${cx}" cy="${cy}" r="${r}"` };
    case "triangle": {
      const points = [
        [cx, cy - r],
        [cx + r * 0.87, cy + r * 0.5],
        [cx - r * 0.87, cy + r * 0.5],
      ]
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      return { tag: "polygon", attrs: `points="${points}"` };
    }
    case "diamond": {
      const points = [
        [cx, cy - r],
        [cx + r, cy],
        [cx, cy + r],
        [cx - r, cy],
      ]
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      return { tag: "polygon", attrs: `points="${points}"` };
    }
    default:
      throw new Error(`Unknown shape: ${shape}`);
  }
}

/** A flat two-tone placeholder image: a field, one geometric form, a centred label. */
function placeholderSvg({ aspectRatio, plate, label }) {
  const [w, h] = ASPECT_SIZE[aspectRatio];
  const fieldColor = plate.field === "canvas" ? COLOR.canvas : COLOR.ink;
  const labelColor = plate.field === "canvas" ? COLOR.ink70 : COLOR.canvas60;
  const cx = w / 2;
  const cy = h / 2 - h * 0.03;
  const r = Math.min(w, h) * 0.24;
  const shape = shapePath(plate.shape, cx, cy, r);
  const fillAttrs = plate.fill
    ? `fill="${plate.shapeColor}"`
    : `fill="none" stroke="${plate.shapeColor}" stroke-width="${(r * 0.14).toFixed(1)}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${fieldColor}"/>
  <${shape.tag} ${shape.attrs} ${fillAttrs}/>
  <text x="${w / 2}" y="${h - h * 0.06}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="${Math.round(Math.min(w, h) * 0.032)}" fill="${labelColor}" letter-spacing="1">FS &#183; ${label}</text>
</svg>
`;
}

// ---------------------------------------------------------------------------
// File manifest — every path referenced by the content files, in a fixed
// order so plate-cycling is deterministic across runs.
// ---------------------------------------------------------------------------

// `plateIndex` pins each file to a plate explicitly, so adding or removing
// entries never reshuffles the shapes already reviewed on the others.
const IMAGE_FILES = [
  ...Array.from({ length: 8 }, (_, i) => ({
    file: `case-${String(i + 1).padStart(2, "0")}.svg`,
    aspectRatio: "4:3",
    plateIndex: i,
  })),
  ...MOSAIC_ASPECT_RATIOS.map((aspectRatio, i) => ({
    file: `mosaic-${String(i + 1).padStart(2, "0")}.svg`,
    aspectRatio,
    plateIndex: 40 + i,
  })),
];

function main() {
  mkdirSync(MEDIA_DIR, { recursive: true });

  IMAGE_FILES.forEach(({ file, aspectRatio, plateIndex }) => {
    const plate = PLATES[plateIndex % PLATES.length];
    const svg = placeholderSvg({ aspectRatio, plate, label: aspectRatio });
    writeFileSync(join(MEDIA_DIR, file), svg);
    console.log(`wrote ${file}`);
  });

  console.log(`\nDone: ${IMAGE_FILES.length} files in ${MEDIA_DIR}`);
}

main();
