#!/usr/bin/env node
// Import curated icons from Phosphor (https://phosphoricons.com, MIT) into
// src/data/icons.js. We use the "fill" weight — solid silhouettes that match
// the single-fill renderer. Each Phosphor fill SVG is already one <path> on a
// 0 0 256 256 viewBox with no background rect, so import is just: grab the path
// d and store viewBox: [256, 256].
//
// MIT license — no in-app attribution required, but Phosphor is credited in the
// About modal as good practice.
//
// Usage: node scripts/import-phosphor.mjs
// Expects the phosphor core repo cloned at /tmp/phosphor.

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_JS = join(ROOT, 'src/data/icons.js')
const PH_DIR = '/tmp/phosphor'
const FILL = join(PH_DIR, 'assets/fill')

// Curated trial batch. `name` is the Phosphor icon name; file is `${name}-fill.svg`.
const MANIFEST = [
  { name: 'lightning',    id: 'ph-lightning',   label: 'Lightning',   group: 'Modern' },
  { name: 'flame',        id: 'ph-flame',       label: 'Flame',       group: 'Modern' },
  { name: 'shield',       id: 'ph-shield',      label: 'Shield',      group: 'Modern' },
  { name: 'crown',        id: 'ph-crown',       label: 'Crown',       group: 'Modern' },
  { name: 'star',         id: 'ph-star',        label: 'Star',        group: 'Modern' },
  { name: 'sun',          id: 'ph-sun',         label: 'Sun',         group: 'Modern' },
  { name: 'moon',         id: 'ph-moon',        label: 'Moon',        group: 'Modern' },
  { name: 'heart',        id: 'ph-heart',       label: 'Heart',       group: 'Modern' },
  { name: 'trophy',       id: 'ph-trophy',      label: 'Trophy',      group: 'Modern' },
  { name: 'soccer-ball',  id: 'ph-soccer-ball', label: 'Soccer Ball', group: 'Modern' },
  { name: 'sneaker',      id: 'ph-sneaker',     label: 'Sneaker',     group: 'Modern' },
  { name: 'anchor',       id: 'ph-anchor',      label: 'Anchor',      group: 'Modern' },
  { name: 'sword',        id: 'ph-sword',       label: 'Sword',       group: 'Modern' },
  { name: 'key',          id: 'ph-key',         label: 'Key',         group: 'Modern' },
  { name: 'feather',      id: 'ph-feather',     label: 'Feather',     group: 'Modern' },
  { name: 'bird',         id: 'ph-bird',        label: 'Bird',        group: 'Modern' },
  { name: 'horse',        id: 'ph-horse',       label: 'Horse',       group: 'Modern' },
  { name: 'mountains',    id: 'ph-mountains',   label: 'Mountains',   group: 'Modern' },
]

function ensureRepo() {
  if (existsSync(FILL)) return
  console.log('Cloning phosphor core to', PH_DIR, '…')
  execSync(`git clone --depth 1 https://github.com/phosphor-icons/core.git ${PH_DIR}`, { stdio: 'inherit' })
}

function extractPaths(svg) {
  const ds = []
  const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/g
  let m
  while ((m = re.exec(svg)) !== null) ds.push(m[1].trim())
  return ds
}

function formatEntry({ id, label, group }, paths) {
  const pathsLiteral = paths.map(d => `'${d}'`).join(',\n      ')
  return `  {
    id: '${id}',
    label: '${label}',
    group: '${group}',
    viewBox: [256, 256],
    paths: [
      ${pathsLiteral},
    ],
  },`
}

function main() {
  ensureRepo()
  const src = readFileSync(ICONS_JS, 'utf8')
  const existingIds = new Set([...src.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]))

  const entries = []
  let skipped = 0
  for (const item of MANIFEST) {
    if (existingIds.has(item.id)) { console.warn(`skip (id exists): ${item.id}`); skipped++; continue }
    const file = join(FILL, `${item.name}-fill.svg`)
    if (!existsSync(file)) { console.warn(`skip (missing): ${item.name}-fill.svg`); skipped++; continue }
    const paths = extractPaths(readFileSync(file, 'utf8'))
    if (!paths.length) { console.warn(`skip (no paths): ${item.name}`); skipped++; continue }
    entries.push(formatEntry(item, paths))
  }
  if (!entries.length) { console.log('Nothing to import.'); return }

  const marker = /\n\]\s*\n\s*export const iconsById/
  if (!marker.test(src)) throw new Error('Could not find icons array close marker')
  const block = `\n\n  // ── Imported from Phosphor (MIT) ──\n${entries.join('\n')}\n`
  writeFileSync(ICONS_JS, src.replace(marker, `${block}]\n\nexport const iconsById`))

  console.log(`Imported ${entries.length} Phosphor icons (${skipped} skipped).`)
  console.log('Source: https://phosphoricons.com (MIT)')
}

main()
