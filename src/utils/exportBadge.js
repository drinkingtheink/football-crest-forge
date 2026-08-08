// Export the crest as a transparent PNG or a self-contained SVG.
//
// PNG rasterizes a cleaned clone of the badge SVG (fonts embedded as base64
// @font-face so text renders faithfully through <img>).
//
// SVG converts every text element to vector outlines ("Create Outlines"): glyphs
// become <path> geometry with no font dependency at all, so a print shop needs no
// font files. Glyph shapes come from opentype.js; glyph *placement* comes from the
// browser's own SVG text-layout APIs (getStartPositionOfChar / getRotationOfChar),
// which handle straight text and curved textPath (arc) text uniformly. opentype.js
// (lazy-loaded, only on SVG export) reads WOFF v1 natively, so we fetch each used
// family+weight as a static WOFF from Fontsource on jsDelivr (real per-weight files
// → correct bold; no woff2 decompression needed).

const SVGNS = 'http://www.w3.org/2000/svg'
const VIEWBOX_W = 200
const VIEWBOX_H = 240

async function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Build a download filename from the crest's texts (prefer the club-name row),
// always prefixed with the app name.
export function crestFilename(texts, ext = 'png') {
  const name = texts?.find(t => t.id === 'club-name')?.content
    || texts?.[0]?.content
    || ''
  const slug = slugify(name)
  return `crest-foundry${slug ? `-${slug}` : ''}.${ext}`
}

// ── Font embedding (PNG, and SVG fallback for any un-outlined text) ──────────
// Fetch a family's Google Fonts CSS (subsetted to `chars`) and inline each
// referenced font file as a base64 data URI. Returns @font-face CSS or ''.
async function embedFont(family, chars) {
  const fam = encodeURIComponent(family).replace(/%20/g, '+')
  const text = chars ? `&text=${encodeURIComponent(chars)}` : ''
  const url = `https://fonts.googleapis.com/css2?family=${fam}:wght@400;700${text}&display=swap`
  try {
    const cssRes = await fetch(url)
    if (!cssRes.ok) return ''
    const css = await cssRes.text()
    const faceRe = /@font-face\s*{[^}]*}/g
    const urlRe = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/
    const faces = css.match(faceRe) || []
    const rebuilt = await Promise.all(faces.map(async (face) => {
      const m = face.match(urlRe)
      if (!m) return ''
      try {
        const fontRes = await fetch(m[1])
        if (!fontRes.ok) return ''
        const b64 = await bufferToBase64(await fontRes.arrayBuffer())
        return face.replace(urlRe, `url(data:font/woff2;base64,${b64})`)
      } catch { return '' }
    }))
    return rebuilt.join('\n')
  } catch { return '' }
}

async function embedFontsInto(clone, texts) {
  const charsByFamily = new Map()
  for (const t of texts || []) {
    if (!t.fontFamily) continue
    const prev = charsByFamily.get(t.fontFamily) || ''
    charsByFamily.set(t.fontFamily, prev + (t.content || ''))
  }
  const fontCss = (await Promise.all(
    [...charsByFamily].map(([family, chars]) => embedFont(family, [...new Set(chars)].join(''))),
  )).filter(Boolean).join('\n')
  if (fontCss) {
    const style = document.createElementNS(SVGNS, 'style')
    style.textContent = fontCss
    clone.insertBefore(style, clone.firstChild)
  }
}

// Symbols render with `paint-order="stroke fill"` so the stroke sits behind the
// fill (only its outer half shows — a thin outline). Illustrator and some other
// SVG consumers ignore paint-order and paint the stroke centered on top of the
// fill, which reads ~2× thicker. Reproduce paint-order with explicit draw order:
// a stroke-only copy first (behind), then a fill-only copy on top.
function flattenPaintOrder(root) {
  root.querySelectorAll('[paint-order]').forEach(el => {
    const stroke = el.style.stroke || el.getAttribute('stroke')
    if (!stroke || stroke === 'none') { el.removeAttribute('paint-order'); return }
    const behind = el.cloneNode(true)   // stroke only
    const front = el.cloneNode(true)    // fill only
    behind.removeAttribute('paint-order')
    front.removeAttribute('paint-order')
    behind.style.fill = 'none'
    front.style.stroke = 'none'
    front.removeAttribute('stroke-width')
    el.replaceWith(behind, front)
  })
}

// Compute the export frame in viewBox user units. Defaults to the badge frame
// (0 0 200 240), but EXPANDS to include any content dragged outside it (free
// symbols, arc text, etc.) plus a small margin — so nothing gets clipped or left
// off the artboard. Measured on the live (laid-out) SVG with the decorative
// data-export-hide layers hidden so they don't skew the bounds.
function exportFrame(svgEl) {
  const MARGIN = 8
  const hidden = [...svgEl.querySelectorAll('[data-export-hide]')]
  const prevDisplay = hidden.map(el => el.style.display)
  hidden.forEach(el => { el.style.display = 'none' })
  let bb
  try { bb = svgEl.getBBox() } catch { bb = null } finally {
    hidden.forEach((el, i) => { el.style.display = prevDisplay[i] })
  }
  if (!bb || !bb.width || !bb.height) return { x: 0, y: 0, w: VIEWBOX_W, h: VIEWBOX_H }

  const bx2 = bb.x + bb.width, by2 = bb.y + bb.height
  const x1 = bb.x < 0 ? bb.x - MARGIN : 0
  const y1 = bb.y < 0 ? bb.y - MARGIN : 0
  const x2 = bx2 > VIEWBOX_W ? bx2 + MARGIN : VIEWBOX_W
  const y2 = by2 > VIEWBOX_H ? by2 + MARGIN : VIEWBOX_H
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

const fmt = n => Number(n.toFixed(2))

// ── Clean clone shared by both formats ──────────────────────────────────────
// Strip decorative / interaction-only layers (data-export-hide) and the
// presentation drop-shadow. Keeps the `0 0 200 240` viewBox; callers set size.
function buildCleanCrestSvg(svgEl) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.querySelectorAll('[data-export-hide]').forEach(el => el.remove())
  clone.style.filter = 'none'
  clone.removeAttribute('filter')
  // Drop decorative element-level filters (hover / selection glow) so an active
  // selection or hover never bakes a gold halo into the exported artwork.
  clone.querySelectorAll('*').forEach(el => { if (el.style && el.style.filter) el.style.filter = 'none' })
  return clone
}

// ── Text → outline (SVG export) ─────────────────────────────────────────────
let _otPromise
async function loadOpentype() {
  _otPromise ??= import('opentype.js').then(m => m.default || m)
  return _otPromise
}

function weightToNum(w) {
  if (w == null) return 400
  if (w === 'bold') return 700
  if (w === 'normal') return 400
  const n = parseInt(w, 10)
  return Number.isNaN(n) ? 400 : n
}

const fontSlug = family => family.toLowerCase().replace(/\s+/g, '-')

// Fetch a family+weight as a static WOFF from Fontsource (jsDelivr) and parse it
// with opentype.js. Falls back to lighter weights if the exact one isn't published.
async function loadFontForOutline(opentype, family, weight) {
  const s = fontSlug(family)
  const candidates = [...new Set([weight, 700, 400])]
  for (const w of candidates) {
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/${s}/files/${s}-latin-${w}-normal.woff`
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      return opentype.parse(await res.arrayBuffer())
    } catch { /* try next weight */ }
  }
  throw new Error(`no Fontsource woff for ${family} ${weight}`)
}

// Replace each <text> in `clone` with vector <path> outlines, measuring glyph
// positions on the live (laid-out) `liveSvg`. Returns the list of config texts
// that could NOT be outlined (font load failed) so the caller can embed those.
async function outlineTexts(liveSvg, clone, texts) {
  const opentype = await loadOpentype()

  // Group used glyphs per family+weight, and index text meta by id.
  const byKey = new Map()
  const metaById = new Map()
  for (const t of texts || []) {
    if (!t.fontFamily || !t.content) continue
    const weight = weightToNum(t.fontWeight)
    const key = `${t.fontFamily}__${weight}`
    if (!byKey.has(key)) byKey.set(key, { family: t.fontFamily, weight, chars: new Set() })
    for (const ch of t.content) byKey.get(key).chars.add(ch)
    metaById.set(t.id, { key, color: t.color, strokeColor: t.strokeColor, strokeWidth: t.strokeWidth })
  }

  const fonts = new Map()
  await Promise.all([...byKey].map(async ([key, { family, weight }]) => {
    try {
      fonts.set(key, await loadFontForOutline(opentype, family, weight))
    } catch {
      fonts.set(key, null)
    }
  }))

  const failed = []
  for (const liveT of liveSvg.querySelectorAll('text[data-text-id]')) {
    const id = liveT.getAttribute('data-text-id')
    const cloneT = clone.querySelector(`text[data-text-id="${CSS.escape(id)}"]`)
    const meta = metaById.get(id)
    if (!cloneT || !meta) continue
    const font = fonts.get(meta.key)
    const cfgText = texts.find(t => t.id === id)
    if (!font) { if (cfgText) failed.push(cfgText); continue }

    const fontSize = parseFloat(liveT.getAttribute('font-size')) || 14
    const content = liveT.textContent || ''
    const n = liveT.getNumberOfChars()

    const g = document.createElementNS(SVGNS, 'g')
    g.setAttribute('fill', meta.color || '#000000')
    // Text stroke — carry through to the outlined glyphs. paint-order is
    // flattened into stroke-behind/fill-front copies after outlining (below).
    if (meta.strokeWidth > 0) {
      g.setAttribute('stroke', meta.strokeColor || '#000000')
      g.setAttribute('stroke-width', meta.strokeWidth)
      g.setAttribute('stroke-linejoin', 'round')
      g.setAttribute('paint-order', 'stroke fill')
    }
    const tr = cloneT.getAttribute('transform')
    if (tr) g.setAttribute('transform', tr)

    let out = ''
    for (let i = 0; i < n; i++) {
      const glyph = font.charToGlyph(content[i])
      if (!glyph) continue
      const d = glyph.getPath(0, 0, fontSize).toPathData(3)
      if (!d || d === 'Z') continue
      const start = liveT.getStartPositionOfChar(i)
      const rot = liveT.getRotationOfChar(i)
      const t = `translate(${start.x.toFixed(2)},${start.y.toFixed(2)})` + (rot ? ` rotate(${rot.toFixed(3)})` : '')
      out += `<path d="${d}" transform="${t}"/>`
    }
    g.innerHTML = out
    cloneT.replaceWith(g)
  }
  return failed
}

// ── Public API ──────────────────────────────────────────────────────────────

// Rasterize the live badge <svg> to a transparent PNG and download it.
export async function exportCrestPng(svgEl, { texts = [], pxWidth = 1600, filename = 'crest.png' } = {}) {
  const frame = exportFrame(svgEl)
  const clone = buildCleanCrestSvg(svgEl)
  await embedFontsInto(clone, texts)
  const density = pxWidth / VIEWBOX_W // keep crest detail constant if the frame expands
  const outW = Math.round(frame.w * density)
  const outH = Math.round(frame.h * density)
  clone.setAttribute('viewBox', `${fmt(frame.x)} ${fmt(frame.y)} ${fmt(frame.w)} ${fmt(frame.h)}`)
  clone.setAttribute('width', outW)
  clone.setAttribute('height', outH)

  const svgStr = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = outW
        canvas.height = outH
        canvas.getContext('2d').drawImage(img, 0, 0, outW, outH)
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return reject(new Error('PNG encode failed'))
          triggerDownload(pngBlob, filename)
          resolve()
        }, 'image/png')
      }
      img.onerror = () => reject(new Error('SVG render failed'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Export the badge as a self-contained, transparent SVG with all text converted
// to vector outlines (no font dependency). If a font can't be loaded to outline,
// that text is left as <text> and its font is embedded as a fallback.
export async function exportCrestSvg(svgEl, { texts = [], pxWidth = 800, filename = 'crest.svg' } = {}) {
  const frame = exportFrame(svgEl)
  const clone = buildCleanCrestSvg(svgEl)

  let failed = []
  try {
    failed = await outlineTexts(svgEl, clone, texts)
  } catch {
    // Outlining unavailable — embed every font so the SVG still renders.
    failed = texts
  }
  if (failed.length) await embedFontsInto(clone, failed)

  // Flatten AFTER outlining: outlineTexts sets paint-order on the outlined <g>,
  // and any text left as <text> (font load failed) still carries paint-order —
  // both are converted to explicit stroke-behind/fill-front draw order here.
  flattenPaintOrder(clone)

  const density = pxWidth / VIEWBOX_W
  clone.setAttribute('viewBox', `${fmt(frame.x)} ${fmt(frame.y)} ${fmt(frame.w)} ${fmt(frame.h)}`)
  clone.setAttribute('width', Math.round(frame.w * density))
  clone.setAttribute('height', Math.round(frame.h * density))

  const svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone)
  triggerDownload(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), filename)
}
