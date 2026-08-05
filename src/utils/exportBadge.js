// Export the crest as a transparent PNG or a self-contained SVG.
//
// The badge SVG references Google web fonts by family name only. A standalone
// SVG (rasterized through <img> for PNG, or opened on its own as a file) does
// NOT inherit the page's loaded fonts, so text would fall back to a system
// serif. To keep text faithful we fetch each used font's files and inline them
// as base64 @font-face rules inside the exported SVG. The same cleaned,
// font-embedded SVG backs both the PNG (rasterized) and SVG (serialized) paths.

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

// Fetch a family's Google Fonts CSS, then inline each referenced font file as a
// data URI. Returns a CSS string of @font-face rules (or '' on any failure).
// `chars` restricts the request to only the glyphs the crest uses (via Google
// Fonts' &text= subsetting) so the export stays small — one tiny face per family
// instead of every unicode-range subset.
async function embedFont(family, chars) {
  const fam = encodeURIComponent(family).replace(/%20/g, '+')
  const text = chars ? `&text=${encodeURIComponent(chars)}` : ''
  const url = `https://fonts.googleapis.com/css2?family=${fam}:wght@400;700${text}&display=swap`
  try {
    const cssRes = await fetch(url)
    if (!cssRes.ok) return ''
    const css = await cssRes.text()

    const faceRe = /@font-face\s*{[^}]*}/g
    // gstatic serves both `…/xxx.woff2` (full) and `…/l/font?kit=…` (subsetted,
    // no extension) — match either; the `format('woff2')` stays in the rule.
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
      } catch {
        return ''
      }
    }))
    return rebuilt.join('\n')
  } catch {
    return ''
  }
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

// Produce a cleaned, self-contained clone of the live badge <svg>:
//   - decorative / interaction-only layers stripped (shimmer, depth overlay,
//     guides, size hint, hit-test path — tagged data-export-hide),
//   - presentation drop-shadow removed for crisp edges on transparency,
//   - used fonts inlined as subsetted base64 @font-face so text is faithful.
// The returned <svg> keeps its `0 0 200 240` viewBox; callers set width/height.
async function buildCleanCrestSvg(svgEl, texts = []) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  clone.querySelectorAll('[data-export-hide]').forEach(el => el.remove())

  clone.style.filter = 'none'
  clone.removeAttribute('filter')

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
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = fontCss
    clone.insertBefore(style, clone.firstChild)
  }

  return clone
}

// Rasterize the live badge <svg> to a transparent PNG and download it.
export async function exportCrestPng(svgEl, { texts = [], pxWidth = 1600, filename = 'crest.png' } = {}) {
  const clone = await buildCleanCrestSvg(svgEl, texts)
  const pxHeight = Math.round(pxWidth * VIEWBOX_H / VIEWBOX_W)
  clone.setAttribute('width', pxWidth)
  clone.setAttribute('height', pxHeight)

  const svgStr = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = pxWidth
        canvas.height = pxHeight
        canvas.getContext('2d').drawImage(img, 0, 0, pxWidth, pxHeight)
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

// Export the live badge as a self-contained, transparent-background SVG file.
// Text stays as real <text> (crisp at any scale, still styleable) with the used
// fonts embedded so the file renders identically anywhere it's opened.
export async function exportCrestSvg(svgEl, { texts = [], pxWidth = 800, filename = 'crest.svg' } = {}) {
  const clone = await buildCleanCrestSvg(svgEl, texts)
  // Nominal intrinsic size for viewers that ignore the viewBox; scales cleanly.
  clone.setAttribute('width', pxWidth)
  clone.setAttribute('height', Math.round(pxWidth * VIEWBOX_H / VIEWBOX_W))

  const svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone)
  triggerDownload(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), filename)
}
