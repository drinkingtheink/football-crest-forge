const GOLD = '#e8c84a'

// One-shot particle burst on a transparent canvas overlay.
// cx/cy: badge center in canvas pixel coordinates.
export function burstParticles(canvas, cx, cy, palette) {
  const ctx = canvas.getContext('2d')
  const colors = [
    ...palette.filter(c => c && c.toUpperCase() !== '#000000'),
    GOLD, GOLD, '#ffffff',
  ]

  const particles = []
  const count = 32

  for (let i = 0; i < count; i++) {
    const angle  = Math.random() * Math.PI * 2
    const speed  = 2.5 + Math.random() * 5.5
    const radius = 50 + Math.random() * 100

    particles.push({
      x:     cx + Math.cos(angle) * radius * 0.4,
      y:     cy + Math.sin(angle) * radius * 0.4,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed - 1,
      size:  1.2 + Math.random() * 2.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      life:  1,
      decay: 0.02 + Math.random() * 0.028,
      cross: Math.random() > 0.5,
    })
  }

  // Brief flash on the canvas — the "hit" feeling
  ctx.fillStyle = 'rgba(232, 200, 74, 0.12)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let rafId = null
  let flashAlpha = 0.12

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fade out the initial flash
    if (flashAlpha > 0) {
      flashAlpha = Math.max(0, flashAlpha - 0.012)
      ctx.fillStyle = `rgba(232, 200, 74, ${flashAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    let any = false
    for (const p of particles) {
      if (p.life <= 0) continue
      any = true

      p.x  += p.vx
      p.y  += p.vy
      p.vx *= 0.91
      p.vy *= 0.91
      p.life -= p.decay

      const a = Math.max(0, p.life)
      ctx.globalAlpha = a
      ctx.fillStyle   = p.color

      if (p.cross) {
        const s = p.size * 1.5
        ctx.fillRect(p.x - s * 0.18, p.y - s * 0.65, s * 0.36, s * 1.3)
        ctx.fillRect(p.x - s * 0.65, p.y - s * 0.18, s * 1.3, s * 0.36)
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * a), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.globalAlpha = 1

    if (any || flashAlpha > 0) {
      rafId = requestAnimationFrame(frame)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(rafId)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}
