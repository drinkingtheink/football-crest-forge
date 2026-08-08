function encode(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function toRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgba(hex, alpha) {
  const { r, g, b } = toRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

// Perceptual-ish luminance, 0 (black) – 255 (white).
function luminance(hex) {
  const { r, g, b } = toRgb(hex)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

// Blend two hex colours; t=0 → a, t=1 → b.
function mix(a, b, t) {
  const ca = toRgb(a), cb = toRgb(b)
  const ch = v => v.toString(16).padStart(2, '0')
  return '#' + ch(Math.round(ca.r + (cb.r - ca.r) * t))
              + ch(Math.round(ca.g + (cb.g - ca.g) * t))
              + ch(Math.round(ca.b + (cb.b - ca.b) * t))
}

// A club colour lifted to a bright "ink" that always reads on the dark base —
// dark colours get pulled toward white the most, so navy/maroon stay visible.
function inkColor(hex) {
  const lum = luminance(hex)
  const t = lum < 90 ? 0.6 : lum < 150 ? 0.38 : 0.2
  return mix(hex, '#ffffff', t)
}

// A deep, near-black backdrop tinted by the club colour — classy, and tied to
// the palette without ever getting bright enough to fight the crest.
function baseColor(hex) {
  return mix(hex, '#07070e', 0.86)
}

const tint  = (hex, t) => mix(hex, '#ffffff', t)   // toward white
const shade = (hex, t) => mix(hex, '#000000', t)   // toward black

// A coherent colour set for a pattern at a given tonal range. Each tone pulls
// three club colours (c0/c1/c2) into lighter/darker variants and flips the
// contrast: dark + medium grounds carry light "ink"; the light ground carries
// dark ink. This is what makes the same motif read as three distinct moods.
function toneSet(palette, tone = 'dark') {
  const c0 = palette[0] || '#888888'
  const c1 = palette[1] || c0
  const c2 = palette[2] || c1
  if (tone === 'light') {
    return {
      base: tint(c0, 0.88), baseHi: tint(c0, 0.95), baseDeep: tint(c0, 0.8),
      ink0: shade(c0, 0.12), ink1: shade(c1, 0.12), ink2: shade(c2, 0.08),
      strong: 0.55, soft: 0.34,
    }
  }
  if (tone === 'medium') {
    return {
      base: shade(c0, 0.4), baseHi: shade(c0, 0.24), baseDeep: shade(c0, 0.56),
      ink0: tint(c0, 0.55), ink1: tint(c1, 0.5), ink2: tint(c2, 0.45),
      strong: 0.5, soft: 0.32,
    }
  }
  const b = baseColor(c0)
  return {
    base: b, baseHi: mix(b, inkColor(c0), 0.12), baseDeep: mix(b, '#000000', 0.35),
    ink0: inkColor(c0), ink1: inkColor(c1), ink2: inkColor(c2),
    strong: 0.5, soft: 0.3,
  }
}

// ── Aurora thumbnail ────────────────────────────────────────────────────────
export function auroraBg(palette) {
  const c = (i, a) => rgba(palette[i % palette.length] || '#888888', a)
  return {
    background: [
      `radial-gradient(ellipse 180% 70% at 10% 25%,  ${c(0, 0.68)} 0%, transparent 58%)`,
      `radial-gradient(ellipse 150% 60% at 90% 80%,  ${c(1, 0.60)} 0%, transparent 55%)`,
      `radial-gradient(ellipse 120% 65% at 55% 5%,   ${c(2, 0.50)} 0%, transparent 52%)`,
      `radial-gradient(ellipse 160% 50% at 15% 100%, ${c(0, 0.42)} 0%, transparent 56%)`,
      `radial-gradient(ellipse 100% 70% at 78% 44%,  ${c(1, 0.34)} 0%, transparent 50%)`,
      `#07070e`,
    ].join(', '),
    backgroundColor: '#07070e',
  }
}

// ── Waves ──────────────────────────────────────────────────────────────────
const WAVE_PATH = `M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z`
const wavesSvg = fill => `<svg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'><path d='${WAVE_PATH}' fill='${fill}' fill-rule='evenodd'/></svg>`

// Two-tone flowing waves: a bolder c0 layer over an offset, softer c1 layer.
export function wavesBg(palette, tone = 'dark') {
  const { base, ink0, ink1, strong, soft } = toneSet(palette, tone)
  return {
    backgroundImage: `${encode(wavesSvg(rgba(ink0, strong)))}, ${encode(wavesSvg(rgba(ink1, soft)))}`,
    backgroundPosition: '0 0, 26px 11px',
    backgroundColor: base,
  }
}

// ── Criss-Cross ────────────────────────────────────────────────────────────
export function crisscrossBg(palette, tone = 'dark') {
  const { base, ink0, strong } = toneSet(palette, tone)
  const primary = rgba(ink0, strong * 0.9)
  const svg = `<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><path d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544V0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2V5.374zm0 5.656l22.627 22.627-1.414 1.414L0 13.86v-2.83zm0 5.656l19.8 19.8-1.415 1.413L0 19.514v-2.83zm0 5.657l16.97 16.97-1.414 1.415L0 25.172v-2.83zM0 28l14.142 14.142-1.414 1.414L0 30.828V28zm0 5.657L11.314 44.97 9.9 46.386l-9.9-9.9v-2.828zm0 5.657L8.485 47.8 7.07 49.212 0 42.143v-2.83zm0 5.657l5.657 5.657-1.414 1.415L0 47.8v-2.83zm0 5.657l2.828 2.83-1.414 1.413L0 53.456v-2.83zM54.627 60L30 35.373 5.373 60H8.2L30 38.2 51.8 60h2.827zm-5.656 0L30 41.03 11.03 60h2.828L30 43.858 46.142 60h2.83zm-5.656 0L30 46.686 16.686 60h2.83L30 49.515 40.485 60h2.83zm-5.657 0L30 52.343 22.343 60h2.83L30 55.172 34.828 60h2.83zM32 60l-2-2-2 2h4zM59.716 0l-28 28 1.414 1.414L60 2.544V0h-.284zM60 5.373L34.544 30.828l1.414 1.415L60 8.2V5.374zm0 5.656L37.373 33.656l1.414 1.414L60 13.86v-2.83zm0 5.656l-19.8 19.8 1.415 1.413L60 19.514v-2.83zm0 5.657l-16.97 16.97 1.414 1.415L60 25.172v-2.83zM60 28L45.858 42.142l1.414 1.414L60 30.828V28zm0 5.657L48.686 44.97l1.415 1.415 9.9-9.9v-2.828zm0 5.657L51.515 47.8l1.414 1.413 7.07-7.07v-2.83zm0 5.657l-5.657 5.657 1.414 1.415L60 47.8v-2.83zm0 5.657l-2.828 2.83 1.414 1.413L60 53.456v-2.83zM39.9 16.385l1.414-1.414L30 3.658 18.686 14.97l1.415 1.415 9.9-9.9 9.9 9.9zm-2.83 2.828l1.415-1.414L30 9.313 21.515 17.8l1.414 1.413 7.07-7.07 7.07 7.07zm-2.827 2.83l1.414-1.416L30 14.97l-5.657 5.657 1.414 1.415L30 17.8l4.243 4.242zm-2.83 2.827l1.415-1.414L30 20.626l-2.828 2.83 1.414 1.414L30 23.456l1.414 1.414zM56.87 59.414L58.284 58 30 29.716 1.716 58l1.414 1.414L30 32.544l26.87 26.87z' fill='${primary}' fill-rule='evenodd'/></svg>`
  return { backgroundImage: encode(svg), backgroundColor: base }
}

// ── Pinstripe ────────────────────────────────────────────────────────────────
// Fine two-tone diagonal pinstripes over a subtly graded base — tailored and
// sleek, like a club suit. Primary lines in c0, a thinner accent in c1 between.
export function pinstripeBg(palette, tone = 'dark') {
  const { base, baseDeep, ink0, ink1, strong, soft } = toneSet(palette, tone)
  const line  = rgba(ink0, strong)
  const accent = rgba(ink1, soft)
  return {
    background: [
      `repeating-linear-gradient(45deg, ${line} 0, ${line} 1.25px, transparent 1.25px, transparent 15px)`,
      `repeating-linear-gradient(45deg, transparent 0, transparent 7.5px, ${accent} 7.5px, ${accent} 8.25px, transparent 8.25px, transparent 15px)`,
      `linear-gradient(135deg, ${base} 0%, ${baseDeep} 100%)`,
    ].join(', '),
    backgroundColor: base,
  }
}

// ── Diamonds ──────────────────────────────────────────────────────────────────
// Heraldic argyle lattice — crossed hairlines in c0 and c1 over a base lit with
// a soft c2 glow. Understated and classy, and clearly club-coloured.
export function diamondsBg(palette, tone = 'dark') {
  const { base, ink0, ink1, ink2, soft } = toneSet(palette, tone)
  const baseHi = mix(base, ink2, 0.16)
  const line  = rgba(ink0, soft * 0.85)
  const line2 = rgba(ink1, soft * 0.85)
  return {
    background: [
      `repeating-linear-gradient(45deg, ${line} 0, ${line} 1px, transparent 1px, transparent 30px)`,
      `repeating-linear-gradient(-45deg, ${line2} 0, ${line2} 1px, transparent 1px, transparent 30px)`,
      `radial-gradient(ellipse 120% 90% at 50% 35%, ${baseHi} 0%, ${base} 70%)`,
    ].join(', '),
    backgroundColor: base,
  }
}

// ── Dots ──────────────────────────────────────────────────────────────────────
// A fine stipple in the secondary colour over a c0-tinted base — minimal, classy.
export function dotsBg(palette, tone = 'dark') {
  const { base, ink1, strong } = toneSet(palette, tone)
  const dot = rgba(ink1, strong)
  return {
    backgroundImage: `radial-gradient(circle, ${dot} 1.6px, transparent 1.9px)`,
    backgroundSize: '18px 18px',
    backgroundColor: base,
  }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
// Graph paper: bold c0 major lines every 90px with fine c1 minor lines between.
export function gridBg(palette, tone = 'dark') {
  const { base, ink0, ink1, strong, soft } = toneSet(palette, tone)
  const major = rgba(ink0, strong)
  const minor = rgba(ink1, soft + 0.1)
  return {
    background: [
      `repeating-linear-gradient(0deg,  ${major} 0 1.3px, transparent 1.3px 90px)`,
      `repeating-linear-gradient(90deg, ${major} 0 1.3px, transparent 1.3px 90px)`,
      `repeating-linear-gradient(0deg,  ${minor} 0 1px, transparent 1px 22.5px)`,
      `repeating-linear-gradient(90deg, ${minor} 0 1px, transparent 1px 22.5px)`,
    ].join(', '),
    backgroundColor: base,
  }
}

// ── Zigzag ──────────────────────────────────────────────────────────────────
// Two-tone chevrons — the secondary colour zigzagging over a c0 base.
export function zigzagBg(palette, tone = 'dark') {
  const { base, ink1, strong } = toneSet(palette, tone)
  const c = rgba(ink1, strong)
  const s = 26, h = s / 2
  return {
    background: [
      `linear-gradient(135deg, ${c} 25%, transparent 25%) -${h}px 0 / ${s}px ${s}px`,
      `linear-gradient(225deg, ${c} 25%, transparent 25%) -${h}px 0 / ${s}px ${s}px`,
      `linear-gradient(315deg, ${c} 25%, transparent 25%) 0 0 / ${s}px ${s}px`,
      `linear-gradient(45deg,  ${c} 25%, transparent 25%) 0 0 / ${s}px ${s}px`,
    ].join(', '),
    backgroundColor: base,
  }
}
