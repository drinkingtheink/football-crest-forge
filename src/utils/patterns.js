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

// ── Color selection ────────────────────────────────────────────────────────
// Always dark base so the badge stays readable.
// Pattern colors come from palette; fall back gracefully with 1 color.
function pickColors(palette, primaryOpacity = 0.28, secondaryOpacity = 0.16) {
  const c0 = palette[0] || '#ffffff'
  const c1 = palette[1] || c0
  return {
    primary:   rgba(c0, primaryOpacity),
    secondary: rgba(c1, secondaryOpacity),
  }
}

// ── Hexagons ───────────────────────────────────────────────────────────────
// Mathematically exact pointy-top hex grid.
// Tile: 24×42 (side=14, r=12, minimal repeating unit for 2 offset columns).
// One full hex + one downward edge — everything else is covered by adjacent tiles.
export function hexagonsBg(palette) {
  const { primary } = pickColors(palette, 0.3)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='42'>
    <path d='M12 0 L24 7 L24 21 L12 28 L0 21 L0 7 Z' fill='none' stroke='${primary}' stroke-width='1.5'/>
    <path d='M12 28 L12 42' fill='none' stroke='${primary}' stroke-width='1.5'/>
  </svg>`
  return { backgroundImage: encode(svg), backgroundColor: '#07070e' }
}

// ── Topography ─────────────────────────────────────────────────────────────
// Contour-line style repeating pattern.
// Each path starts and ends at the same Y so horizontal tiling is seamless.
// Two line weights let 2-palette-color badges feel intentional.
export function topographyBg(palette) {
  const { primary, secondary } = pickColors(palette, 0.28, 0.15)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='180'>
    <path d='M0 20 C45 0 90 48 140 20 C190 -8 245 40 300 20'
      fill='none' stroke='${primary}' stroke-width='1.5'/>
    <path d='M0 60 C35 38 100 88 145 58 C190 28 255 72 300 60'
      fill='none' stroke='${secondary}' stroke-width='1'/>
    <path d='M0 95 C55 72 105 118 155 90 C205 62 250 105 300 95'
      fill='none' stroke='${primary}' stroke-width='1.5'/>
    <path d='M0 128 C50 108 115 150 160 122 C205 94 258 132 300 128'
      fill='none' stroke='${secondary}' stroke-width='1'/>
    <path d='M0 158 C60 140 120 172 165 152 C210 130 262 160 300 158'
      fill='none' stroke='${primary}' stroke-width='1.5'/>
    <path d='M0 5 C30 -6 65 14 90 5 C115 -4 140 10 160 5'
      fill='none' stroke='${secondary}' stroke-width='1'/>
    <path d='M195 45 C220 30 265 58 300 45'
      fill='none' stroke='${secondary}' stroke-width='1'/>
  </svg>`
  return { backgroundImage: encode(svg), backgroundColor: '#07070e' }
}
