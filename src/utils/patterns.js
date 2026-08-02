function encode(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function rgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function pickColors(palette, primaryOpacity = 0.28, secondaryOpacity = 0.16) {
  const c0 = palette[0] || '#ffffff'
  const c1 = palette[1] || c0
  return {
    primary:   rgba(c0, primaryOpacity),
    secondary: rgba(c1, secondaryOpacity),
  }
}

// ── Hexagons ───────────────────────────────────────────────────────────────
// Pointy-top honeycomb grid. Tile is the minimal repeating unit:
// one full hex + connecting stem to the next row.
export function hexagonsBg(palette) {
  const { primary, secondary } = pickColors(palette, 0.35, 0.12)
  // side=12 → tile 20.8×36, rounded to 21×36
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='21' height='36'>
    <path d='M10.5 0 L21 6 L21 18 L10.5 24 L0 18 L0 6 Z'
      fill='${secondary}' stroke='${primary}' stroke-width='1'/>
    <path d='M10.5 24 L10.5 36' fill='none' stroke='${primary}' stroke-width='1'/>
  </svg>`
  return { backgroundImage: encode(svg), backgroundColor: '#07070e' }
}

// ── Topography ─────────────────────────────────────────────────────────────
// Contour-map style lines. Each path starts and ends at the same y value
// so horizontal tiling is seamless. Two cubic bezier control points per
// half give organic, non-mechanical curves.
export function topographyBg(palette) {
  const { primary, secondary } = pickColors(palette, 0.38, 0.2)
  const W = 200, H = 140

  // [baseY, [cp1dy, cp2dy, midDy, cp3dy, cp4dy], color, strokeWidth]
  const lines = [
    { y: 10,  cps: [ 10, -8,   6,  -10,  8],  color: primary,   w: 1.5 },
    { y: 24,  cps: [ -8, 12,  -6,   14, -8],  color: secondary, w: 1   },
    { y: 38,  cps: [ 12, -10,  8,   -8, 10],  color: primary,   w: 1.5 },
    { y: 52,  cps: [-10,  8, -12,   10, -6],  color: secondary, w: 1   },
    { y: 66,  cps: [  8, -12, 10,  -12,  8],  color: primary,   w: 1.5 },
    { y: 80,  cps: [-12,  6,  -8,    8, -10], color: secondary, w: 1   },
    { y: 94,  cps: [  6, -8,  12,   -8,  6],  color: primary,   w: 1.5 },
    { y: 108, cps: [ -8, 10,  -6,   10, -8],  color: secondary, w: 1   },
    { y: 122, cps: [ 10, -6,   8,   -6, 10],  color: primary,   w: 1.5 },
    { y: 136, cps: [ -6,  8, -10,    8, -6],  color: secondary, w: 1   },
  ]

  const paths = lines.map(({ y, cps: [a, b, c, d, e], color, w }) => {
    const x1 = (W * 0.15).toFixed(1), x2 = (W * 0.38).toFixed(1)
    const xm = (W / 2).toFixed(1)
    const x3 = (W * 0.62).toFixed(1), x4 = (W * 0.85).toFixed(1)
    const pathD = `M0,${y} C${x1},${y+a} ${x2},${y+b} ${xm},${y+c} C${x3},${y+d} ${x4},${y+e} ${W},${y}`
    return `<path d='${pathD}' fill='none' stroke='${color}' stroke-width='${w}'/>`
  })

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>
    ${paths.join('\n    ')}
  </svg>`
  return { backgroundImage: encode(svg), backgroundColor: '#07070e' }
}
