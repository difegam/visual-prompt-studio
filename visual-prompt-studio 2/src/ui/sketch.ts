/**
 * Programmatic preview engine. Three layers compose the way the prompt does:
 *   design layer    → layout: background structure, headline placement, a slot for imagery
 *   art layer       → the motif drawn inside that slot
 *   technique layer → a finish applied over everything (SVG filters and overlays)
 *
 * These are original vector studies that show visual vocabulary. They are not model output
 * and are not reproductions of existing artworks.
 */
import type { ArtId, DesignId, TechniqueId } from "../domain/styles";
import { luminance } from "../domain/palettes";

export interface Inks {
  readonly ground: string;
  readonly a: string;
  readonly b: string;
  /** Highest-contrast of a/b against the ground, used for type. */
  readonly text: string;
}

export function inksFrom(hexes: readonly [string, string, string]): Inks {
  const [ground, a, b] = hexes;
  const lg = luminance(ground);
  const contrast = (x: string) => {
    const l = luminance(x);
    return (Math.max(l, lg) + 0.05) / (Math.min(l, lg) + 0.05);
  };
  return { ground, a, b, text: contrast(a) >= contrast(b) ? a : b };
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Head {
  x: number;
  y: number;
  size: number;
  anchor: "start" | "middle";
  rotate?: number;
  maxW: number;
  spacing?: number;
  fill?: string;
  /** Rendered on a block of this color. */
  block?: string;
}

interface Layout {
  back: string;
  slot: Rect;
  head: Head;
  foot: { x: number; y: number; anchor: "start" | "middle" };
}

const f = (n: number) => Math.round(n * 10) / 10;
const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!,
  );

/** Deterministic pseudo-random so previews don't flicker between renders. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

/* ── design layer ────────────────────────────────────────────────────── */

const LAYOUTS: Record<DesignId, (W: number, H: number, k: Inks) => Layout> = {
  swiss: (W, H, k) => ({
    back: `<rect x="${f(W * 0.06)}" y="${f(H * 0.3)}" width="${f(W * 0.035)}" height="${f(H * 0.58)}" fill="${k.a}"/>
      <rect x="${f(W * 0.06)}" y="${f(H * 0.235)}" width="${f(W * 0.36)}" height="${f(H * 0.008)}" fill="${k.text}"/>`,
    slot: { x: W * 0.42, y: H * 0.3, w: W * 0.5, h: H * 0.58 },
    head: {
      x: W * 0.06,
      y: H * 0.14,
      size: W * 0.1,
      anchor: "start",
      maxW: W * 0.86,
    },
    foot: { x: W * 0.06, y: H * 0.94, anchor: "start" },
  }),
  bauhaus: (W, H, k) => ({
    back: `<circle cx="${f(W * 0.3)}" cy="${f(H * 0.7)}" r="${f(W * 0.26)}" fill="${k.a}"/>
      <polygon points="${f(W * 0.55)},${f(H * 0.92)} ${f(W * 0.95)},${f(H * 0.92)} ${f(W * 0.75)},${f(H * 0.5)}" fill="${k.b}"/>
      <rect x="${f(W * 0.06)}" y="${f(H * 0.2)}" width="${f(W * 0.88)}" height="${f(H * 0.012)}" fill="${k.text}"/>`,
    slot: { x: W * 0.46, y: H * 0.24, w: W * 0.46, h: H * 0.38 },
    head: {
      x: W * 0.06,
      y: H * 0.15,
      size: W * 0.095,
      anchor: "start",
      maxW: W * 0.88,
    },
    foot: { x: W * 0.06, y: H * 0.96, anchor: "start" },
  }),
  constructivism: (W, H, k) => ({
    back: `<polygon points="0,${f(H * 0.62)} ${W},${f(H * 0.26)} ${W},${f(H * 0.44)} 0,${f(H * 0.8)}" fill="${k.a}"/>
      <polygon points="${f(W * 0.62)},${H} ${W},${f(H * 0.55)} ${W},${H}" fill="${k.b}"/>`,
    slot: { x: W * 0.08, y: H * 0.08, w: W * 0.5, h: H * 0.42 },
    head: {
      x: W * 0.06,
      y: H * 0.69,
      size: W * 0.11,
      anchor: "start",
      rotate: -19,
      maxW: W * 0.95,
      fill: k.ground,
    },
    foot: { x: W * 0.06, y: H * 0.94, anchor: "start" },
  }),
  "de-stijl": (W, H, k) => {
    const lw = W * 0.03;
    const x1 = W * 0.34;
    const x2 = W * 0.78;
    const y1 = H * 0.3;
    const y2 = H * 0.7;
    return {
      back: `<rect x="0" y="${f(y2)}" width="${f(x1)}" height="${f(H - y2)}" fill="${k.a}"/>
        <rect x="${f(x2)}" y="0" width="${f(W - x2)}" height="${f(y1)}" fill="${k.b}"/>
        <g fill="${k.text}"><rect x="${f(x1)}" y="0" width="${f(lw)}" height="${H}"/><rect x="${f(x2)}" y="0" width="${f(lw)}" height="${f(y2)}"/>
        <rect x="0" y="${f(y1)}" width="${W}" height="${f(lw)}"/><rect x="0" y="${f(y2)}" width="${W}" height="${f(lw)}"/></g>`,
      slot: {
        x: x1 + lw * 1.5,
        y: y1 + lw * 1.5,
        w: x2 - x1 - lw * 2.5,
        h: y2 - y1 - lw * 2.5,
      },
      head: {
        x: W * 0.05,
        y: H * 0.24,
        size: W * 0.075,
        anchor: "start",
        maxW: x1 * 2.1,
      },
      foot: { x: x1 + lw * 2, y: H * 0.86, anchor: "start" },
    };
  },
  "art-deco": (W, H, k) => {
    const cx = W / 2;
    const rays = Array.from({ length: 13 }, (_, i) => {
      const a = Math.PI + (i * Math.PI) / 12;
      return `<line x1="${f(cx)}" y1="${f(H * 0.62)}" x2="${f(cx + Math.cos(a) * W)}" y2="${f(H * 0.62 + Math.sin(a) * W)}"/>`;
    }).join("");
    const steps = [0.44, 0.34, 0.24]
      .map(
        (w, i) =>
          `<rect x="${f(cx - (W * w) / 2)}" y="${f(H * (0.62 + i * 0.08))}" width="${f(W * w)}" height="${f(H * 0.4)}" fill="${i % 2 ? k.ground : k.a}"/>`,
      )
      .join("");
    return {
      back: `<g stroke="${k.a}" stroke-width="${f(W * 0.006)}" opacity=".85">${rays}</g>${steps}`,
      slot: { x: W * 0.3, y: H * 0.36, w: W * 0.4, h: H * 0.26 },
      head: {
        x: cx,
        y: H * 0.16,
        size: W * 0.085,
        anchor: "middle",
        maxW: W * 0.86,
        spacing: W * 0.008,
      },
      foot: { x: cx, y: H * 0.95, anchor: "middle" },
    };
  },
  "art-nouveau": (W, H, k) => {
    const vine = (x: number, dir: number) =>
      `<path d="M${f(x)},${f(H * 0.96)} C${f(x + dir * W * 0.12)},${f(H * 0.7)} ${f(x - dir * W * 0.08)},${f(H * 0.45)} ${f(x + dir * W * 0.06)},${f(H * 0.22)} S${f(x + dir * W * 0.3)},${f(H * 0.04)} ${f(W / 2)},${f(H * 0.05)}" fill="none" stroke="${k.a}" stroke-width="${f(W * 0.018)}" stroke-linecap="round"/>
       <ellipse cx="${f(x + dir * W * 0.07)}" cy="${f(H * 0.56)}" rx="${f(W * 0.035)}" ry="${f(W * 0.07)}" transform="rotate(${dir * 30} ${f(x + dir * W * 0.07)} ${f(H * 0.56)})" fill="${k.a}"/>`;
    return {
      back: `<path d="M${f(W * 0.1)},${f(H * 0.95)} V${f(H * 0.32)} Q${f(W / 2)},${f(H * 0.02)} ${f(W * 0.9)},${f(H * 0.32)} V${f(H * 0.95)} Z" fill="none" stroke="${k.text}" stroke-width="${f(W * 0.008)}"/>
        ${vine(W * 0.08, 1)}${vine(W * 0.92, -1)}`,
      slot: { x: W * 0.24, y: H * 0.36, w: W * 0.52, h: H * 0.44 },
      head: {
        x: W / 2,
        y: H * 0.29,
        size: W * 0.085,
        anchor: "middle",
        maxW: W * 0.7,
      },
      foot: { x: W / 2, y: H * 0.89, anchor: "middle" },
    };
  },
  memphis: (W, H, k) => {
    const r = rng(7);
    const bits = Array.from({ length: 14 }, (_, i) => {
      const x = r() * W;
      const y = r() * H;
      const c = i % 2 ? k.a : k.b;
      const t = i % 3;
      if (t === 0)
        return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(W * 0.025)}" fill="${c}"/>`;
      if (t === 1)
        return `<polygon points="${f(x)},${f(y)} ${f(x + W * 0.06)},${f(y + W * 0.02)} ${f(x + W * 0.02)},${f(y + W * 0.06)}" fill="${c}"/>`;
      return `<path d="M${f(x)},${f(y)} l${f(W * 0.03)},${f(-W * 0.03)} l${f(W * 0.03)},${f(W * 0.03)} l${f(W * 0.03)},${f(-W * 0.03)}" fill="none" stroke="${c}" stroke-width="${f(W * 0.012)}" stroke-linecap="round"/>`;
    }).join("");
    return {
      back: `${bits}<rect x="${f(W * 0.05)}" y="${f(H * 0.08)}" width="${f(W * 0.8)}" height="${f(H * 0.15)}" fill="${k.b}" transform="rotate(-4 ${f(W / 2)} ${f(H * 0.15)})"/>`,
      slot: { x: W * 0.2, y: H * 0.34, w: W * 0.6, h: H * 0.42 },
      head: {
        x: W * 0.09,
        y: H * 0.2,
        size: W * 0.1,
        anchor: "start",
        rotate: -4,
        maxW: W * 0.74,
        fill: k.ground,
      },
      foot: { x: W * 0.09, y: H * 0.9, anchor: "start" },
    };
  },
  "japanese-minimal": (W, H) => ({
    back: "",
    slot: { x: W * 0.5, y: H * 0.38, w: W * 0.36, h: H * 0.36 },
    head: {
      x: W * 0.1,
      y: H * 0.14,
      size: W * 0.055,
      anchor: "start",
      maxW: W * 0.6,
      spacing: W * 0.006,
    },
    foot: { x: W * 0.1, y: H * 0.9, anchor: "start" },
  }),
  editorial: (W, H, k) => ({
    back: `<rect x="${f(W * 0.06)}" y="${f(H * 0.05)}" width="${f(W * 0.88)}" height="${f(H * 0.004)}" fill="${k.text}"/>
      <rect x="${f(W * 0.06)}" y="${f(H * 0.4)}" width="${f(W * 0.88)}" height="${f(H * 0.004)}" fill="${k.text}"/>`,
    slot: { x: W * 0.06, y: H * 0.44, w: W * 0.88, h: H * 0.46 },
    head: {
      x: W * 0.06,
      y: H * 0.2,
      size: W * 0.13,
      anchor: "start",
      maxW: W * 0.88,
    },
    foot: { x: W * 0.06, y: H * 0.95, anchor: "start" },
  }),
  "polish-poster": (W, H, k) => ({
    back: `<path d="M${f(W * 0.12)},${f(H * 0.3)} C${f(W * 0.2)},${f(H * 0.05)} ${f(W * 0.85)},${f(H * 0.08)} ${f(W * 0.88)},${f(H * 0.36)} S${f(W * 0.7)},${f(H * 0.82)} ${f(W * 0.42)},${f(H * 0.78)} S${f(W * 0.04)},${f(H * 0.55)} ${f(W * 0.12)},${f(H * 0.3)}Z" fill="${k.a}" opacity=".9"/>`,
    slot: { x: W * 0.2, y: H * 0.16, w: W * 0.6, h: H * 0.56 },
    head: {
      x: W * 0.08,
      y: H * 0.88,
      size: W * 0.1,
      anchor: "start",
      rotate: -3,
      maxW: W * 0.84,
    },
    foot: { x: W * 0.08, y: H * 0.95, anchor: "start" },
  }),
};

/* ── art layer ───────────────────────────────────────────────────────── */

function motif(id: ArtId, s: Rect, k: Inks, uid: string): string {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const m = Math.min(s.w, s.h);
  switch (id) {
    case "none":
      return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(m * 0.38)}" fill="${k.a}"/>
        <rect x="${f(cx - m * 0.08)}" y="${f(cy - m * 0.42)}" width="${f(m * 0.16)}" height="${f(m * 0.84)}" fill="${k.b}"/>`;
    case "surrealism": {
      const base = s.y + s.h * 0.92;
      return `<rect x="${f(s.x)}" y="${f(base)}" width="${f(s.w)}" height="${f(s.h * 0.08)}" fill="${k.b}" opacity=".25"/>
        <path d="M${f(cx - m * 0.34)},${f(base)} V${f(cy - m * 0.05)} A${f(m * 0.34)},${f(m * 0.34)} 0 0 1 ${f(cx + m * 0.34)},${f(cy - m * 0.05)} V${f(base)}" fill="none" stroke="${k.a}" stroke-width="${f(m * 0.13)}"/>
        <circle cx="${f(cx + m * 0.25)}" cy="${f(s.y + s.h * 0.14)}" r="${f(m * 0.1)}" fill="${k.b}"/>
        <rect x="${f(cx - m * 0.03)}" y="${f(base - m * 0.16)}" width="${f(m * 0.06)}" height="${f(m * 0.16)}" fill="${k.text}"/>
        <path d="M${f(cx)},${f(base)} L${f(s.x + s.w)},${f(base + s.h * 0.05)} L${f(s.x + s.w)},${f(base + s.h * 0.08)}Z" fill="${k.text}" opacity=".35"/>`;
    }
    case "pop-art":
      return `<defs><pattern id="dots${uid}" width="${f(m * 0.06)}" height="${f(m * 0.06)}" patternUnits="userSpaceOnUse"><circle cx="${f(m * 0.03)}" cy="${f(m * 0.03)}" r="${f(m * 0.016)}" fill="${k.b}"/></pattern></defs>
        <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(m * 0.42)}" fill="${k.a}" stroke="${k.text}" stroke-width="${f(m * 0.04)}"/>
        <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(m * 0.42)}" fill="url(#dots${uid})"/>
        <path d="M${f(cx - m * 0.2)},${f(cy + m * 0.05)} Q${f(cx)},${f(cy + m * 0.3)} ${f(cx + m * 0.2)},${f(cy + m * 0.05)}" fill="none" stroke="${k.text}" stroke-width="${f(m * 0.05)}" stroke-linecap="round"/>`;
    case "op-art": {
      const rings = Array.from({ length: 9 }, (_, i) => {
        const r = m * 0.48 * (1 - i / 9);
        return `<ellipse cx="${f(cx + i * m * 0.012)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r * 0.92)}" fill="${i % 2 ? k.ground : k.text}"/>`;
      }).join("");
      return rings;
    }
    case "cubism": {
      const r = rng(3);
      return Array.from({ length: 7 }, (_, i) => {
        const pts = Array.from(
          { length: 4 },
          () => `${f(s.x + r() * s.w)},${f(s.y + r() * s.h)}`,
        ).join(" ");
        const fill = [k.a, k.b, k.text][i % 3];
        return `<polygon points="${pts}" fill="${fill}" opacity="${i % 3 === 2 ? 0.75 : 0.9}"/>`;
      }).join("");
    }
    case "ukiyo-e": {
      const base = s.y + s.h * 0.75;
      return `<polygon points="${f(cx + m * 0.05)},${f(base)} ${f(cx + m * 0.28)},${f(s.y + s.h * 0.35)} ${f(cx + m * 0.5)},${f(base)}" fill="${k.b}"/>
        <path d="M${f(s.x)},${f(base + m * 0.12)} C${f(s.x + s.w * 0.1)},${f(s.y + s.h * 0.2)} ${f(cx)},${f(s.y)} ${f(cx + m * 0.05)},${f(s.y + s.h * 0.3)} C${f(cx - m * 0.08)},${f(s.y + s.h * 0.22)} ${f(cx - m * 0.12)},${f(s.y + s.h * 0.4)} ${f(cx - m * 0.04)},${f(s.y + s.h * 0.48)} C${f(cx - m * 0.2)},${f(s.y + s.h * 0.6)} ${f(cx)},${f(base + m * 0.08)} ${f(s.x + s.w)},${f(base + m * 0.12)} V${f(s.y + s.h)} H${f(s.x)}Z" fill="${k.a}" stroke="${k.text}" stroke-width="${f(m * 0.015)}"/>`;
    }
    case "dada-collage": {
      const r = rng(11);
      const scraps = Array.from({ length: 5 }, (_, i) => {
        const w = s.w * (0.3 + r() * 0.3);
        const h = s.h * (0.2 + r() * 0.25);
        const x = s.x + r() * (s.w - w);
        const y = s.y + r() * (s.h - h);
        const fill = [k.a, k.b, k.text, k.ground, k.a][i]!;
        return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" stroke="${k.text}" stroke-width=".6" transform="rotate(${f((r() - 0.5) * 24)} ${f(x + w / 2)} ${f(y + h / 2)})"/>`;
      }).join("");
      return `${scraps}<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(m * 0.18)}" ry="${f(m * 0.09)}" fill="${k.ground}" stroke="${k.text}" stroke-width="${f(m * 0.02)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(m * 0.06)}" fill="${k.text}"/>`;
    }
    case "suprematism":
      return `<rect x="${f(s.x + s.w * 0.1)}" y="${f(s.y + s.h * 0.2)}" width="${f(s.w * 0.55)}" height="${f(s.h * 0.14)}" fill="${k.text}" transform="rotate(-22 ${f(cx)} ${f(cy)})"/>
        <rect x="${f(s.x + s.w * 0.45)}" y="${f(s.y + s.h * 0.5)}" width="${f(s.w * 0.3)}" height="${f(s.w * 0.3)}" fill="${k.a}" transform="rotate(14 ${f(cx)} ${f(cy)})"/>
        <rect x="${f(s.x + s.w * 0.2)}" y="${f(s.y + s.h * 0.72)}" width="${f(s.w * 0.5)}" height="${f(s.h * 0.04)}" fill="${k.b}" transform="rotate(-8 ${f(cx)} ${f(cy)})"/>
        <circle cx="${f(s.x + s.w * 0.22)}" cy="${f(s.y + s.h * 0.62)}" r="${f(m * 0.08)}" fill="${k.b}"/>`;
    case "psychedelia": {
      const rings = Array.from({ length: 6 }, (_, i) => {
        const r = m * 0.48 * (1 - i / 7);
        const pts = Array.from({ length: 49 }, (_, j) => {
          const a = (j / 48) * Math.PI * 2;
          const rr = r * (1 + 0.08 * Math.sin(a * 6 + i));
          return `${j ? "L" : "M"}${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`;
        }).join("");
        return `<path d="${pts}Z" fill="${i % 2 ? k.b : k.a}"/>`;
      }).join("");
      return rings;
    }
    case "cut-paper":
      return `<path d="M${f(cx - m * 0.3)},${f(s.y + s.h)} C${f(cx - m * 0.5)},${f(cy)} ${f(cx - m * 0.1)},${f(cy - m * 0.2)} ${f(cx - m * 0.2)},${f(s.y)} C${f(cx + m * 0.05)},${f(cy - m * 0.3)} ${f(cx - m * 0.05)},${f(cy + m * 0.1)} ${f(cx + m * 0.02)},${f(s.y + s.h)}Z" fill="${k.a}"/>
        <path d="M${f(cx + m * 0.05)},${f(s.y + s.h)} C${f(cx + m * 0.3)},${f(cy + m * 0.2)} ${f(cx + m * 0.1)},${f(cy - m * 0.1)} ${f(cx + m * 0.38)},${f(cy - m * 0.32)} C${f(cx + m * 0.5)},${f(cy)} ${f(cx + m * 0.25)},${f(cy + m * 0.25)} ${f(cx + m * 0.3)},${f(s.y + s.h)}Z" fill="${k.b}"/>
        <circle cx="${f(cx + m * 0.28)}" cy="${f(s.y + s.h * 0.12)}" r="${f(m * 0.07)}" fill="${k.text}"/>`;
  }
}

/* ── technique layer ─────────────────────────────────────────────────── */

interface Finish {
  defs: string;
  /** Filter applied to the whole artwork group. */
  filter?: string;
  /** Duplicate the motif with an offset (misregistration). */
  offset?: number;
  overlay?: string;
}

function finish(
  id: TechniqueId,
  W: number,
  H: number,
  k: Inks,
  uid: string,
): Finish {
  const grain = (amount: number) =>
    `<filter id="grain${uid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${amount} -${amount * 0.45}" result="a"/><feComposite in="SourceGraphic" in2="a" operator="out"/></filter>`;
  const rough = (scale: number) =>
    `<filter id="rough${uid}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="${scale}"/></filter>`;
  switch (id) {
    case "clean":
    case "mono-accent":
      return { defs: "" };
    case "risograph":
      return { defs: grain(1.6), filter: `grain${uid}`, offset: W * 0.008 };
    case "screenprint":
      return { defs: "", offset: W * 0.012 };
    case "letterpress":
      return { defs: rough(W * 0.006) + grain(0.8), filter: `rough${uid}` };
    case "cyanotype":
      return { defs: grain(1.1), filter: `grain${uid}` };
    case "linocut":
      return {
        defs: rough(W * 0.012),
        filter: `rough${uid}`,
        overlay: Array.from({ length: 10 }, (_, i) => {
          const y = H * (0.1 + i * 0.085);
          return `<path d="M${f(W * 0.62)},${f(y)} q${f(W * 0.08)},${f(-H * 0.01)} ${f(W * 0.18)},0" stroke="${k.ground}" stroke-width="${f(W * 0.006)}" fill="none" opacity=".7"/>`;
        }).join(""),
      };
    case "etching":
      return {
        defs: `<pattern id="hatch${uid}" width="${f(W * 0.018)}" height="${f(W * 0.018)}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="${f(W * 0.018)}" stroke="${k.ground}" stroke-width="${f(W * 0.005)}"/></pattern>`,
        overlay: `<rect width="${W}" height="${H}" fill="url(#hatch${uid})" opacity=".55"/>`,
      };
    case "halftone":
      return {
        defs: `<pattern id="ht${uid}" width="${f(W * 0.022)}" height="${f(W * 0.022)}" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><rect width="${f(W * 0.022)}" height="${f(W * 0.022)}" fill="${k.ground}"/><circle cx="${f(W * 0.011)}" cy="${f(W * 0.011)}" r="${f(W * 0.0085)}" fill="#000"/></pattern><mask id="htm${uid}"><rect width="${W}" height="${H}" fill="#fff"/><rect width="${W}" height="${H}" fill="url(#ht${uid})" opacity=".55"/></mask>`,
        overlay: `<rect width="${W}" height="${H}" fill="${k.ground}" mask="url(#htm${uid})" opacity=".45"/>`,
      };
  }
}

/* ── type ────────────────────────────────────────────────────────────── */

/** Split a headline into at most two balanced lines. */
function lines(text: string, maxChars: number): string[] {
  const t = text.trim();
  if (t.length <= maxChars || !t.includes(" ")) return [t];
  const words = t.split(/\s+/);
  let best = [t];
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (d < bestDiff) {
      bestDiff = d;
      best = [a, b];
    }
  }
  return best;
}

function headline(
  h: Head,
  text: string,
  fontCss: string,
  k: Inks,
  condensed: boolean,
): string {
  if (!text.trim()) return "";
  const per = condensed ? 0.42 : 0.6;
  const ls = lines(text, Math.max(6, Math.floor(h.maxW / (h.size * per))));
  const longest = Math.max(...ls.map((l) => l.length));
  const size = Math.min(h.size, h.maxW / (longest * per + 0.5));
  const lh = size * 1.02;
  const y0 = ls.length > 1 ? h.y - lh * 0.5 : h.y;
  const fill = h.fill ?? k.text;
  const rot = h.rotate
    ? ` transform="rotate(${h.rotate} ${f(h.x)} ${f(h.y)})"`
    : "";
  const spans = ls
    .map(
      (l, i) => `<tspan x="${f(h.x)}" y="${f(y0 + i * lh)}">${esc(l)}</tspan>`,
    )
    .join("");
  return `<text${rot} font-family="${esc(fontCss)}" font-size="${f(size)}" font-weight="700" fill="${fill}" text-anchor="${h.anchor}" letter-spacing="${f(h.spacing ?? 0)}">${spans}</text>`;
}

/* ── public API ──────────────────────────────────────────────────────── */

export interface ProofInput {
  readonly design: DesignId;
  readonly art: ArtId;
  readonly technique: TechniqueId;
  readonly inks: Inks;
  readonly ratio: number; // height / width
  readonly headline: string;
  readonly foot: readonly string[];
  readonly fontCss: string;
  readonly condensed: boolean;
  readonly uid: string;
  readonly label?: string;
}

export function proofSvg(p: ProofInput): string {
  const W = 300;
  const H = Math.round(W * p.ratio);
  const k = p.inks;
  const L = LAYOUTS[p.design](W, H, k);
  const fin = finish(p.technique, W, H, k, p.uid);
  const art = motif(p.art, L.slot, k, p.uid);
  const misreg = fin.offset
    ? `<g transform="translate(${f(fin.offset)} ${f(fin.offset * 0.6)})" opacity=".55" style="mix-blend-mode:multiply">${art}</g>`
    : "";
  const foot = p.foot
    .slice(0, 2)
    .map(
      (t, i) =>
        `<text x="${f(L.foot.x)}" y="${f(L.foot.y + i * W * 0.04)}" font-family="${esc(p.fontCss)}" font-size="${f(W * 0.03)}" font-weight="600" fill="${k.text}" text-anchor="${L.foot.anchor}" letter-spacing=".6">${esc(t)}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="background:${k.ground}" role="img" aria-label="${esc(p.label ?? "Style sketch")}">
    <defs>${fin.defs}</defs>
    <g${fin.filter ? ` filter="url(#${fin.filter})"` : ""}>
      <rect width="${W}" height="${H}" fill="${k.ground}"/>
      ${L.back}${art}${misreg}
      ${headline(L.head, p.headline, p.fontCss, k, p.condensed)}
      ${foot}
    </g>
    ${fin.overlay ?? ""}
  </svg>`;
}

/** Imagery-only swatch for art tiles. */
export function motifSvg(art: ArtId, k: Inks, uid: string): string {
  const W = 160;
  const H = 110;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect width="${W}" height="${H}" fill="${k.ground}"/>${motif(art, { x: 30, y: 8, w: 100, h: 94 }, k, uid)}</svg>`;
}

/** Finish-only swatch for technique tiles. */
export function finishSvg(t: TechniqueId, k: Inks, uid: string): string {
  const W = 160;
  const H = 110;
  const fin = finish(t, W, H, k, uid);
  const shapes = `<circle cx="62" cy="56" r="34" fill="${k.a}"/><rect x="78" y="22" width="44" height="66" fill="${k.b}"/>`;
  const mis = fin.offset
    ? `<g transform="translate(${fin.offset} ${fin.offset * 0.6})" opacity=".55" style="mix-blend-mode:multiply">${shapes}</g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="background:${k.ground}" aria-hidden="true"><defs>${fin.defs}</defs><g${fin.filter ? ` filter="url(#${fin.filter})"` : ""}><rect width="${W}" height="${H}" fill="${k.ground}"/>${shapes}${mis}</g>${fin.overlay ?? ""}</svg>`;
}
