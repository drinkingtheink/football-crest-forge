function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function makeCircles(w, h, colors) {
  const circles = []

  // Large ambient blobs — set the color wash
  for (let i = 0; i < 10; i++) {
    circles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: h * (0.3 + Math.random() * 0.45),
      alpha: 0.12 + Math.random() * 0.18,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15,
      ci: i % colors.length,
      type: 'blob',
    })
  }

  // Mid-size bokeh donuts — bright ring, dim center (real lens bokeh shape)
  for (let i = 0; i < 40; i++) {
    circles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 30 + Math.random() * 95,
      alpha: 0.38 + Math.random() * 0.52,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.32,
      ci: i % colors.length,
      type: 'bokeh',
    })
  }

  // Small bright pinpoints — light sources that blur into hot spots
  for (let i = 0; i < 14; i++) {
    circles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 4 + Math.random() * 16,
      alpha: 0.75 + Math.random() * 0.25,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.45,
      ci: i % colors.length,
      type: 'point',
    })
  }

  return circles
}

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

      if (c.type === 'blob') {
        grad.addColorStop(0, `rgba(${r},${g},${b},${c.alpha})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
      } else if (c.type === 'bokeh') {
        // Donut: dim center → bright ring → fade out
        grad.addColorStop(0,    `rgba(${r},${g},${b},${c.alpha * 0.2})`)
        grad.addColorStop(0.52, `rgba(${r},${g},${b},${c.alpha})`)
        grad.addColorStop(0.7,  `rgba(${r},${g},${b},${c.alpha * 0.4})`)
        grad.addColorStop(1,    `rgba(${r},${g},${b},0)`)
      } else {
        // Pinpoint: hot bright core
        grad.addColorStop(0,   `rgba(${r},${g},${b},${c.alpha})`)
        grad.addColorStop(0.35,`rgba(${r},${g},${b},${c.alpha * 0.65})`)
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
      }

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
