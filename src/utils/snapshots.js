const PREFIX = 'crest-forge:snap:'

export async function saveSnapshot(name, config, svgEl) {
  const thumbnail = svgEl ? await captureThumb(svgEl) : null
  const entry = {
    name,
    timestamp: Date.now(),
    config: JSON.parse(JSON.stringify(config)),
    thumbnail,
  }
  localStorage.setItem(PREFIX + name, JSON.stringify(entry))
  return entry
}

export function listSnapshots() {
  const results = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    try { results.push(JSON.parse(localStorage.getItem(key))) } catch {}
  }
  return results.sort((a, b) => b.timestamp - a.timestamp)
}

export function deleteSnapshot(name) {
  localStorage.removeItem(PREFIX + name)
}

async function captureThumb(svgEl) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const svgStr = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const W = 200, H = 240, scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = W * scale
      canvas.height = H * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, W, H)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}
