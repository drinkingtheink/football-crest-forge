function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function drawBokeh(canvas, palette) {
  const { width, height } = canvas
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#07070e'
  ctx.fillRect(0, 0, width, height)

  const colors = palette.filter(Boolean)
  if (!colors.length) return

  // Large soft background blobs
  for (let i = 0; i < 12; i++) {
    const color = colors[i % colors.length]
    const x = Math.random() * width
    const y = Math.random() * height
    const r = height * (0.25 + Math.random() * 0.4)
    const alpha = 0.08 + Math.random() * 0.12

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, hexToRgba(color, alpha))
    grad.addColorStop(1, hexToRgba(color, 0))
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Smaller bright circles — the actual "bokeh" spots
  for (let i = 0; i < 40; i++) {
    const color = colors[i % colors.length]
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 20 + Math.random() * 90
    const alpha = 0.12 + Math.random() * 0.28

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, hexToRgba(color, alpha))
    grad.addColorStop(0.4, hexToRgba(color, alpha * 0.5))
    grad.addColorStop(1, hexToRgba(color, 0))
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}
