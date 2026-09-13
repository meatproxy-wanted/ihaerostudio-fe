/*
 * MOCK ONLY — delete together with lib/mock and public/mock when the real
 * server provides illustrations.
 *
 * Builds the pictogram scenes the mock API offers as illustrations by
 * composing Hugeicons free icons (MIT). Run with:
 *   node scripts/generate-mock-illustrations.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as Icons from "@hugeicons/core-free-icons";

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public/mock/illustrations",
);

const WIDTH = 320;
const HEIGHT = 240;
const INK = "#1f2937";
const STROKE_PX = 4.2;

const PALETTES = {
  blue: { bg: "#e8f0fe", accent: "#2563eb" },
  orange: { bg: "#fff0e3", accent: "#c2410c" },
  green: { bg: "#e5f5ee", accent: "#047857" },
  violet: { bg: "#f0ebfd", accent: "#6d28d9" },
  yellow: { bg: "#fff5d1", accent: "#a16207" },
  gray: { bg: "#edf0f4", accent: "#475569" },
  red: { bg: "#fdeaea", accent: "#b91c1c" },
};

function icon(name) {
  const data = Icons[name];
  if (!data) throw new Error(`Unknown icon: ${name}`);
  return data;
}

function kebab(key) {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function drawIcon(name, { x, y, size, color = INK }) {
  const scale = size / 24;
  const children = icon(name)
    .map(([tag, attrs]) => {
      const rendered = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => {
          if (key === "strokeWidth")
            return `stroke-width="${STROKE_PX / scale}"`;
          return `${kebab(key)}="${value === "currentColor" ? color : value}"`;
        })
        .join(" ");
      return `<${tag} ${rendered}/>`;
    })
    .join("");
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none">${children}</g>`;
}

function backdrop({ x, y, size }) {
  const r = size * 0.64;
  return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${r}" fill="#ffffff" fill-opacity="0.72"/>`;
}

function badge(name, slot, accent) {
  const cx = slot.x + slot.size - 4;
  const cy = slot.y + 4;
  return [
    `<circle cx="${cx}" cy="${cy}" r="21" fill="#ffffff" stroke="${accent}" stroke-width="3"/>`,
    drawIcon(name, { x: cx - 13, y: cy - 13, size: 26, color: accent }),
  ].join("");
}

const LAYOUTS = {
  single: [{ x: 94, y: 54, size: 132 }],
  pair: [
    { x: 40, y: 72, size: 100 },
    { x: 180, y: 72, size: 100 },
  ],
  flow: [
    { x: 26, y: 78, size: 88 },
    { x: 206, y: 78, size: 88 },
  ],
  trio: [
    { x: 22, y: 84, size: 72 },
    { x: 124, y: 84, size: 72 },
    { x: 226, y: 84, size: 72 },
  ],
};

function scene({ palette, layout, icons, badges = [], inner = [], arrows }) {
  const { bg, accent } = PALETTES[palette];
  const slots = LAYOUTS[layout];
  const parts = [
    `<rect width="${WIDTH}" height="${HEIGHT}" rx="28" fill="${bg}"/>`,
    ...slots.map(backdrop),
    ...icons.map((name, index) => drawIcon(name, slots[index])),
  ];
  if (layout === "flow" || arrows) {
    const arrowSlots =
      layout === "flow"
        ? [{ x: 136, y: 98, size: 48 }]
        : [
            { x: 96, y: 106, size: 28 },
            { x: 198, y: 106, size: 28 },
          ];
    parts.push(
      ...arrowSlots.map((slot) =>
        drawIcon("ArrowRight02Icon", { ...slot, color: accent }),
      ),
    );
  }
  for (const { name, slot, size = 38, offsetY = -6 } of inner) {
    const target = slots[slot];
    parts.push(
      drawIcon(name, {
        x: target.x + (target.size - size) / 2,
        y: target.y + (target.size - size) / 2 + offsetY,
        size,
        color: accent,
      }),
    );
  }
  parts.push(
    ...badges.map(({ name, slot }) => badge(name, slots[slot], accent)),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">${parts.join("")}</svg>\n`;
}

const SCENES = {
  tenant: {
    palette: "blue",
    layout: "pair",
    icons: ["User03Icon", "Home01Icon"],
    badges: [{ name: "Key01Icon", slot: 1 }],
  },
  landlord: {
    palette: "orange",
    layout: "pair",
    icons: ["UserIcon", "House03Icon"],
    badges: [{ name: "Key01Icon", slot: 0 }],
  },
  court: { palette: "gray", layout: "single", icons: ["CourtHouseIcon"] },
  "judge-decides": {
    palette: "yellow",
    layout: "pair",
    icons: ["GavelIcon", "LegalDocument01Icon"],
  },
  contract: {
    palette: "green",
    layout: "pair",
    icons: ["ContractsIcon", "HandshakeIcon"],
  },
  "deposit-paid": {
    palette: "blue",
    layout: "trio",
    arrows: true,
    icons: ["User03Icon", "Money01Icon", "UserIcon"],
  },
  "calendar-end": {
    palette: "green",
    layout: "single",
    icons: ["Calendar03Icon"],
    badges: [{ name: "CheckmarkCircle02Icon", slot: 0 }],
  },
  "moving-out": {
    palette: "blue",
    layout: "flow",
    icons: ["Home01Icon", "User03Icon"],
  },
  "money-not-returned": {
    palette: "red",
    layout: "single",
    icons: ["Money01Icon"],
    badges: [{ name: "Cancel01Icon", slot: 0 }],
  },
  "asking-money-back": {
    palette: "blue",
    layout: "pair",
    icons: ["User03Icon", "BubbleChatIcon"],
    inner: [{ name: "Money01Icon", slot: 1 }],
  },
  refusing: {
    palette: "orange",
    layout: "pair",
    icons: ["UserIcon", "BubbleChatCancelIcon"],
  },
  "wallpaper-damage": {
    palette: "orange",
    layout: "pair",
    icons: ["BrickWallIcon", "PaintBrush01Icon"],
    badges: [{ name: "Alert02Icon", slot: 0 }],
  },
  "floor-unknown": {
    palette: "gray",
    layout: "pair",
    icons: ["SofaIcon", "Search01Icon"],
    badges: [{ name: "HelpCircleIcon", slot: 1 }],
  },
  weighing: {
    palette: "violet",
    layout: "trio",
    icons: ["User03Icon", "JusticeScale01Icon", "UserIcon"],
  },
  "court-orders-payment": {
    palette: "yellow",
    layout: "trio",
    arrows: true,
    icons: ["GavelIcon", "Money01Icon", "User03Icon"],
  },
  "money-received": {
    palette: "green",
    layout: "pair",
    icons: ["User03Icon", "Money01Icon"],
    badges: [{ name: "CheckmarkCircle02Icon", slot: 0 }],
  },
  "interest-added": {
    palette: "yellow",
    layout: "pair",
    icons: ["Money01Icon", "Clock01Icon"],
    badges: [{ name: "PlusSignIcon", slot: 0 }],
  },
  "cost-split": {
    palette: "violet",
    layout: "trio",
    icons: ["UserIcon", "Coins01Icon", "User03Icon"],
  },
  "deduct-repair": {
    palette: "orange",
    layout: "pair",
    icons: ["Money01Icon", "PaintBrush01Icon"],
    badges: [{ name: "MinusSignIcon", slot: 0 }],
  },
  "new-tenant-search": {
    palette: "blue",
    layout: "pair",
    icons: ["UserSearch01Icon", "Home01Icon"],
  },
  "evidence-photo": {
    palette: "gray",
    layout: "pair",
    icons: ["Camera01Icon", "LegalDocument01Icon"],
  },
  "not-accepted": {
    palette: "red",
    layout: "pair",
    icons: ["BubbleChatIcon", "JusticeScale01Icon"],
    badges: [{ name: "Cancel01Icon", slot: 0 }],
  },
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [id, spec] of Object.entries(SCENES)) {
  writeFileSync(join(OUT_DIR, `${id}.svg`), scene(spec));
}
console.log(`Wrote ${Object.keys(SCENES).length} illustrations to ${OUT_DIR}`);
