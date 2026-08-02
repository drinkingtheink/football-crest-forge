function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function makeCircles(w, h, colors) {
  const circles = []

  // Large, slow background blobs — set the ambient color wash
  for (let i = 0; i < 7; i++) {
    circles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: h * (0.25 + Math.random() * 0.35),
      alpha: 0.05 + Math.random() * 0.08,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      ci: i % colors.length,
      blob: true,
    })
  }

  // Mid-size bokeh spots — the main visual element
  for (let i = 0; i < 28; i++) {
    circles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 25 + Math.random() * 75,
      alpha: 0.1 + Math.random() * 0.22,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.35,
      ci: i % colors.length,
      blob: false,
    })
  }

  return circles
}

// Returns a controller with stop() and resize() methods.
export function startBokeh(canvas, getPalette) {
  let rafId = null

  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight

  const colors = getPalette().filter(Boolean)
  let circles = makeCircles(canvas.width, canvas.height, colors.length ? colors : ['#ffffff'])

  function frame() {
    const { width, height } = canvas
    const palette = getPalette().filter(Boolean)
    if (!palette.length) { rafId = requestAnimationFrame(frame); return }

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#07070e'
    ctx.fillRect(0, 0, width, height)

    for (const c of circles) {
      const [r, g, b] = hexToRgb(palette[c.ci % palette.length])

      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r)
      grad.addColorStop(0, `rgba(${r},${g},${b},${c.alpha})`)
      if (!c.blob) grad.addColorStop(0.45, `rgba(${r},${g},${b},${c.alpha * 0.4})`)
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`)

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
      ctx.fill()

      c.x += c.vx
      c.y += c.vy
      if (c.x < -c.r) c.x = width + c.r
      if (c.x > width + c.r) c.x = -c.r
      if (c.y < -c.r) c.y = height + c.r
      if (c.y > height + c.r) c.y = -c.r
    }

    rafId = requestAnimationFrame(frame)
  }

  frame()

  return {
    stop()   { cancelAnimationFrame(rafId) },
    resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    },
  }
}
