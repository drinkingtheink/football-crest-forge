const PREFIX = 'crest-foundry:snap:'
const LEGACY_PREFIX = 'crest-forge:snap:'

export async function saveSnapshot(name, config, svgEl) {
  const thumbnail = svgEl ? await captureThumb(svgEl) : null
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const entry = {
    id,
    name,
    timestamp: Date.now(),
    config: JSON.parse(JSON.stringify(config)),
    thumbnail,
  }
  try {
    localStorage.setItem(PREFIX + id, JSON.stringify(entry))
  } catch (e) {
    if (isQuotaError(e)) { const err = new Error('Storage full'); err.code = 'QUOTA'; throw err }
    throw e
  }
  return entry
}

export function listSnapshots() {
  const results = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const matchedPrefix = key?.startsWith(PREFIX) ? PREFIX
      : key?.startsWith(LEGACY_PREFIX) ? LEGACY_PREFIX
      : null
    if (!matchedPrefix) continue
    try {
      const entry = JSON.parse(localStorage.getItem(key))
      // Legacy snapshots were keyed by name and have no id — derive it from the key
      entry.id = entry.id ?? key.slice(matchedPrefix.length)
      results.push(entry)
    } catch {}
  }
  return results.sort((a, b) => b.timestamp - a.timestamp)
}

export function deleteSnapshot(id) {
  localStorage.removeItem(PREFIX + id)
  localStorage.removeItem(LEGACY_PREFIX + id)
}

function isQuotaError(e) {
  return e instanceof DOMException &&
    (e.code === 22 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
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
