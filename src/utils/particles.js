// Unified foundry-spark engine on a transparent canvas overlay.
// A single persistent rAF loop drives both the pointer sparks (emit) and the
// on-change burst (burst): warm forge colours, gravity, streak trails, additive
// glow. The loop parks itself when no sparks are alive.

const SPARK_COLORS = ['#ffffff', '#fff2cc', '#ffd36e', '#ffab2e', '#ff7a1a', '#e8c84a']
const pick = () => SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]

export function createSparkField(canvas) {
  const ctx = canvas.getContext('2d')
  let particles = []
  let flash = 0
  let raf = null
  let running = false

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Warm flash from an anvil strike, fading out
    if (flash > 0) {
      flash = Math.max(0, flash - 0.012)
      ctx.fillStyle = `rgba(255, 140, 40, ${flash})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    let alive = false
    for (const p of particles) {
      if (p.life <= 0) continue
      alive = true
      p.vy += p.grav
      p.vx *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.life -= p.decay
      const flicker = 0.6 + Math.random() * 0.4
      ctx.globalAlpha = Math.max(0, p.life) * flicker
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.size
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6) // streak along velocity
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    particles = particles.filter(p => p.life > 0)

    if (alive || flash > 0) {
      raf = requestAnimationFrame(step)
    } else {
      running = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  function ensureRunning() {
    if (!running) { running = true; raf = requestAnimationFrame(step) }
  }

  return {
    // Pointer sparks: a few embers thrown off (x,y), popping up/out then falling.
    emit(x, y, n = 2, speed = 1) {
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI // mostly upward, spread
        const v = (1 + Math.random() * 2.2) * speed
        particles.push({
          x, y,
          vx: Math.cos(angle) * v + (Math.random() - 0.5),
          vy: Math.sin(angle) * v,
          size: 0.7 + Math.random() * 1.2,
          color: pick(),
          life: 1,
          decay: 0.03 + Math.random() * 0.028,
          grav: 0.10 + Math.random() * 0.09,
        })
      }
      ensureRunning()
    },
    // On-change burst: sparks fly off an anvil strike from (cx,cy).
    burst(cx, cy) {
      flash = 0.14
      for (let i = 0; i < 44; i++) {
        const angle = Math.random() * Math.PI * 2
        const v = 3 + Math.random() * 6.5
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v - 2.5, // bias upward like struck sparks
          size: 0.8 + Math.random() * 1.7,
          color: pick(),
          life: 1,
          decay: 0.016 + Math.random() * 0.018,
          grav: 0.13 + Math.random() * 0.08,
        })
      }
      ensureRunning()
    },
    stop() {
      cancelAnimationFrame(raf)
      running = false
      particles = []
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}
