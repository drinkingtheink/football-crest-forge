// Unified foundry-spark engine on a transparent canvas overlay.
// A single persistent rAF loop drives both the pointer sparks (emit) and the
// on-change burst (burst): warm forge colours, gravity, streak trails, additive
// glow. The loop parks itself when no sparks are alive.

const SPARK_COLORS = ['#ffffff', '#fff2cc', '#ffd36e', '#ffab2e', '#ff7a1a', '#e8c84a']
const pick = () => SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]

// Molten cooling ramp: t=1 white-hot → t=0 dark red. Linear between stops.
const MOLTEN_STOPS = [
  [0.0, [90, 22, 8]],
  [0.15, [200, 48, 18]],
  [0.4, [255, 130, 40]],
  [0.7, [255, 208, 108]],
  [1.0, [255, 255, 238]],
]
function moltenRGB(t) {
  for (let i = 1; i < MOLTEN_STOPS.length; i++) {
    const [t1, c1] = MOLTEN_STOPS[i]
    if (t <= t1) {
      const [t0, c0] = MOLTEN_STOPS[i - 1]
      const k = (t - t0) / (t1 - t0)
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * k),
        Math.round(c0[1] + (c1[1] - c0[1]) * k),
        Math.round(c0[2] + (c1[2] - c0[2]) * k),
      ]
    }
  }
  return MOLTEN_STOPS[MOLTEN_STOPS.length - 1][1]
}

export function createSparkField(canvas) {
  const ctx = canvas.getContext('2d')
  let particles = []
  let trail = []
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
    ctx.lineJoin = 'round'

    // Molten drag trail — a cooling liquid-metal streak, hot at the cursor,
    // fading to dark red down the tail. Two passes: soft glow + bright core.
    for (let i = 1; i < trail.length; i++) {
      const b = trail[i]
      if (b.life <= 0) continue
      const a = trail[i - 1]
      const t = b.life
      const [r, g, bl] = moltenRGB(t)
      ctx.strokeStyle = `rgba(${r},${g},${bl},${t * 0.26})`
      ctx.lineWidth = 11 * t + 1
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      ctx.strokeStyle = `rgba(${r},${g},${bl},${Math.min(1, t * 1.1)})`
      ctx.lineWidth = 4.5 * t + 0.5
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
    }
    for (const p of trail) p.life -= 0.045
    trail = trail.filter(p => p.life > 0)
    const trailAlive = trail.length > 1

    let alive = false
    for (const p of particles) {
      if (p.life <= 0) continue
      alive = true
      p.vy += p.grav
      p.vx *= 0.985
      if (p.dot) p.x += Math.sin((1 - p.life) * 22 + p.wob) * 0.35 // gentle wobble as it rises
      p.x += p.vx
      p.y += p.vy
      p.life -= p.decay
      const flicker = 0.6 + Math.random() * 0.4
      ctx.globalAlpha = Math.max(0, p.life) * flicker
      if (p.dot) {
        // Floating ember — a soft glowing point
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Struck spark — a streak along its velocity
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    particles = particles.filter(p => p.life > 0)

    if (alive || flash > 0 || trailAlive) {
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
    // Molten drag trail: extend the cooling streak to (x,y). Subdivides long
    // jumps so a fast drag stays a connected line rather than dashes.
    drag(x, y) {
      const last = trail[trail.length - 1]
      if (last) {
        const d = Math.hypot(x - last.x, y - last.y)
        if (d < 2) return
        const steps = Math.min(6, Math.floor(d / 10))
        for (let i = 1; i < steps; i++) {
          trail.push({ x: last.x + (x - last.x) * i / steps, y: last.y + (y - last.y) * i / steps, life: 1 })
        }
      }
      trail.push({ x, y, life: 1 })
      if (trail.length > 100) trail.splice(0, trail.length - 100)
      ensureRunning()
    },
    // Welding spray: a burst of hot streaks jetting out from a seam point (x,y)
    // along the outward normal (nx,ny), with a wide fan, quick decay and gravity.
    weld(x, y, nx = 0, ny = 1, n = 2) {
      const base = Math.atan2(ny, nx)
      for (let i = 0; i < n; i++) {
        const angle = base + (Math.random() - 0.5) * 1.7 // ~±49° fan around the normal
        const v = 2.5 + Math.random() * 5.5
        particles.push({
          x, y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          size: 0.5 + Math.random() * 0.9,
          color: pick(),
          life: 1,
          decay: 0.06 + Math.random() * 0.06, // short-lived — sputtering, not lingering
          grav: 0.16 + Math.random() * 0.12,
        })
      }
      ensureRunning()
    },
    // A single ember that floats up from (x,y), wobbling and fading — from the coals.
    float(x, y) {
      const v = 0.4 + Math.random() * 0.5
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -v, // upward
        size: 0.9 + Math.random() * 1,
        color: pick(),
        life: 1,
        decay: 0.004 + Math.random() * 0.004,
        grav: 0.0018, // slight settle near the top of its arc
        dot: true,
        wob: Math.random() * Math.PI * 2,
      })
      ensureRunning()
    },
    stop() {
      cancelAnimationFrame(raf)
      running = false
      particles = []
      trail = []
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}
