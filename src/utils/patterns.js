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

// ── Waves ───────────────────────────────────────────────────────────────────
// Two interlocking wave layers — primary colour dominant, secondary offset
export function wavesBg(palette) {
  const c0 = rgba(palette[0] || '#ffffff', 0.52)
  const c1 = rgba(palette[1] || palette[0] || '#ffffff', 0.26)
  const path = `M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z`
  const wave = (color) => encode(`<svg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'><path d='${path}' fill='${color}' fill-rule='evenodd'/></svg>`)
  return {
    backgroundImage: `${wave(c0)}, ${wave(c1)}`,
    backgroundSize: '100px 20px, 100px 20px',
    backgroundPosition: '0 0, 50px 10px',
    backgroundColor: '#07070e',
  }
}

// ── Criss-Cross ─────────────────────────────────────────────────────────────
// Two diagonal line sets in separate palette colours — forms a diamond grid
export function crisscrossBg(palette) {
  const c0 = rgba(palette[0] || '#ffffff', 0.38)
  const c1 = rgba(palette[1] || palette[0] || '#ffffff', 0.22)
  return {
    backgroundImage: [
      `repeating-linear-gradient( 45deg, ${c0} 0, ${c0} 1.5px, transparent 0, transparent 28px)`,
      `repeating-linear-gradient(-45deg, ${c1} 0, ${c1} 1.5px, transparent 0, transparent 28px)`,
    ].join(', '),
    backgroundColor: '#07070e',
  }
}
