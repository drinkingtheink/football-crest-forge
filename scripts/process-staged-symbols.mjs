#!/usr/bin/env node
// Process hand-drawn SVGs staged in src/data/symbols-to-be-processed/ into
// icons.js entries, then remove the processed files.
//
// These SVGs are single-color silhouettes (Illustrator exports; fills come from
// defaults or a .cls-* class we ignore since every icon renders in one fill).
// We keep the source viewBox as `viewBox: [w, h]` and collect every <path> d.
//
// Edit MANIFEST to assign id/label/group per file, then:
//   node scripts/process-staged-symbols.mjs

import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_JS = join(ROOT, 'src/data/icons.js')
const STAGING = join(ROOT, 'src/data/symbols-to-be-processed')

const MANIFEST = [
  { file: 'dragon.svg',   id: 'dragon-5', label: 'Dragon 5', group: 'Beasts' },
  { file: 'dragon-2.svg', id: 'dragon-6', label: 'Dragon 6', group: 'Beasts' },
  { file: 'gryphon.svg',  id: 'gryphon',  label: 'Gryphon',  group: 'Beasts' },
]

function parseViewBox(svg) {
  const m = svg.match(/viewBox="([\d.\s-]+)"/)
  if (!m) throw new Error('no viewBox')
  const [, , w, h] = m[1].trim().split(/\s+/).map(Number)
  return [w, h]
}

function extractPaths(svg) {
  const ds = []
  const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/g
  let m
  while ((m = re.exec(svg)) !== null) ds.push(m[1].trim())
  return ds
}

function formatEntry({ id, label, group }, viewBox, paths) {
  const pathsLiteral = paths.map(d => `'${d}'`).join(',\n      ')
  return `  {
    id: '${id}',
    label: '${label}',
    group: '${group}',
    viewBox: [${viewBox[0]}, ${viewBox[1]}],
    paths: [
      ${pathsLiteral},
    ],
  },`
}

const src = readFileSync(ICONS_JS, 'utf8')
const existingIds = new Set([...src.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]))

const entries = []
const processed = []
for (const item of MANIFEST) {
  if (existingIds.has(item.id)) { console.warn(`skip (id exists): ${item.id}`); continue }
  const path = join(STAGING, item.file)
  if (!existsSync(path)) { console.warn(`skip (missing): ${item.file}`); continue }
  const svg = readFileSync(path, 'utf8')
  const paths = extractPaths(svg)
  if (!paths.length) { console.warn(`skip (no paths): ${item.file}`); continue }
  entries.push(formatEntry(item, parseViewBox(svg), paths))
  processed.push(path)
}

if (!entries.length) { console.log('Nothing to process.'); process.exit(0) }

const marker = /\n\]\s*\n\s*export const iconsById/
if (!marker.test(src)) throw new Error('Could not find icons array close marker')
const block = `\n\n  // ── Hand-drawn symbols (from staging) ──\n${entries.join('\n')}\n`
writeFileSync(ICONS_JS, src.replace(marker, `${block}]\n\nexport const iconsById`))

for (const p of processed) rmSync(p)
console.log(`Processed ${entries.length} symbols; removed ${processed.length} staged files.`)
