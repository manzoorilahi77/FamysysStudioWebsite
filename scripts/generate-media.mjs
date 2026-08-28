#!/usr/bin/env node
// Generates every placeholder image and video referenced by
// src/infrastructure/content/static/*.content.ts, entirely locally.
//
// Nothing is downloaded — images are hand-built SVG strings and videos are
// synthesized by ffmpeg's `geq` filter from a pure X/Y/T formula (no source
// footage, no stock assets). Every color used is one of the locked design
// tokens from docs/superpowers/specs/2026-08-28-famysys-studio-homepage-design.md.
//
// Deterministic by construction: no Math.random, no Date.now, no external
// input. Re-running against a non-empty public/media/ overwrites every file
// with byte-identical SVGs and (same ffmpeg build, -threads 1) identical MP4s.
//
// Requires ffmpeg on PATH. See README.md.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, "..", "public", "media");

// ---------------------------------------------------------------------------
// Palette — the locked token set. Nothing outside this list.
// ---------------------------------------------------------------------------

const COLOR = {
  canvas: "#F7F5F2",
  ink: "#0F2A4A",
  accent: "#1E6FFF",
  accentOnDark: "#5C96FF",
  ink40: "#0F2A4A66",
  ink60: "#0F2A4A99",
  ink70: "#0F2A4AB3",
  canvas40: "#F7F5F266",
  canvas60: "#F7F5F299",
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
// Video drift patterns. Rendered with ffmpeg's native `gradients` source
// filter (a compiled gradient generator) rather than the `geq` per-pixel
// expression filter — geq evaluates a parsed math expression per pixel per
// frame in an interpreter and is roughly two orders of magnitude slower;
// `gradients` produces the same kind of animated radial glow in seconds.
// Each pattern fixes every parameter that would otherwise default to
// "random" (seed, start point, colors) so output stays deterministic.
// ---------------------------------------------------------------------------

const VIDEO_W = 1280;
const VIDEO_H = 720;
const DURATION = 8;
const FPS = 15;

const DRIFT_PATTERNS = {
  circular: { type: "circular", x0Frac: 0.5, y0Frac: 0.5, seed: 1 },
  diagonal: { type: "radial", x0Frac: 0.3, y0Frac: 0.7, seed: 2 },
  vertical: { type: "spiral", x0Frac: 0.7, y0Frac: 0.3, seed: 3 },
};

/** A static radial-gradient poster approximating the video's opening frame. */
function posterSvg(patternName) {
  const pattern = DRIFT_PATTERNS[patternName];
  const cx = VIDEO_W * pattern.x0Frac;
  const cy = VIDEO_H * pattern.y0Frac;
  const r = Math.hypot(VIDEO_W, VIDEO_H) * 0.35;
  const gradientId = `glow-${patternName}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIDEO_W} ${VIDEO_H}" width="${VIDEO_W}" height="${VIDEO_H}">
  <defs>
    <radialGradient id="${gradientId}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${COLOR.accent}"/>
      <stop offset="100%" stop-color="${COLOR.ink}"/>
    </radialGradient>
  </defs>
  <rect width="${VIDEO_W}" height="${VIDEO_H}" fill="url(#${gradientId})"/>
</svg>
`;
}

/** ffmpeg's lavfi color parser wants 0xRRGGBB, not the CSS-style #RRGGBB used elsewhere. */
function toFfmpegColor(hex) {
  return `0x${hex.slice(1)}`;
}

function generateVideo(outputPath, patternName) {
  const pattern = DRIFT_PATTERNS[patternName];
  const x0 = Math.round(VIDEO_W * pattern.x0Frac);
  const y0 = Math.round(VIDEO_H * pattern.y0Frac);
  const options = [
    `size=${VIDEO_W}x${VIDEO_H}`,
    `rate=${FPS}`,
    `duration=${DURATION}`,
    `type=${pattern.type}`,
    `x0=${x0}`,
    `y0=${y0}`,
    `c0=${toFfmpegColor(COLOR.accent)}`,
    `c1=${toFfmpegColor(COLOR.ink)}`,
    "nb_colors=2",
    "speed=0.03",
    `seed=${pattern.seed}`,
  ].join(":");
  const source = `gradients=${options}`;

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      source,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "30",
      "-threads",
      "1",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      "-fflags",
      "+bitexact",
      "-flags:v",
      "+bitexact",
      "-metadata",
      "creation_time=1970-01-01T00:00:00Z",
      outputPath,
    ],
    { stdio: "inherit" },
  );
}

// ---------------------------------------------------------------------------
// File manifest — every path referenced by the content files, in a fixed
// order so plate-cycling is deterministic across runs.
// ---------------------------------------------------------------------------

const IMAGE_FILES = [
  ...Array.from({ length: 6 }, (_, i) => ({
    file: `case-${String(i + 1).padStart(2, "0")}.svg`,
    aspectRatio: "4:3",
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    file: `logo-${String(i + 1).padStart(2, "0")}.svg`,
    aspectRatio: "1:1",
  })),
];

const VIDEO_FILES = [
  { file: "hero-loop.mp4", poster: "hero-loop-poster.svg", pattern: "circular" },
  { file: "story-01.mp4", poster: "story-01-poster.svg", pattern: "diagonal" },
  { file: "story-02.mp4", poster: "story-02-poster.svg", pattern: "vertical" },
];

function main() {
  mkdirSync(MEDIA_DIR, { recursive: true });

  IMAGE_FILES.forEach(({ file, aspectRatio }, index) => {
    const plate = PLATES[index % PLATES.length];
    const svg = placeholderSvg({ aspectRatio, plate, label: aspectRatio });
    writeFileSync(join(MEDIA_DIR, file), svg);
    console.log(`wrote ${file}`);
  });

  for (const { file, poster, pattern } of VIDEO_FILES) {
    writeFileSync(join(MEDIA_DIR, poster), posterSvg(pattern));
    console.log(`wrote ${poster}`);
    generateVideo(join(MEDIA_DIR, file), pattern);
    console.log(`wrote ${file}`);
  }

  console.log(`\nDone: ${IMAGE_FILES.length + VIDEO_FILES.length * 2} files in ${MEDIA_DIR}`);
}

main();
