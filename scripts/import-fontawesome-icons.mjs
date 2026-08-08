#!/usr/bin/env node
// Import curated icons from Font Awesome Free — Solid style (CC BY 4.0) into
// src/data/icons.js.
//
// FA solid SVGs are a single <path d="…"/> with NO background rect, filled via
// currentColor. Unlike game-icons/MDI the viewBox varies per glyph (widths of
// 448/512/576/640…), so this script parses each file's viewBox rather than
// hard-coding one.
//
// License: Font Awesome Free icons are CC BY 4.0 — attribution IS required.
// "Font Awesome" is credited in src/components/AboutModal.vue.
//
// Usage: node scripts/import-fontawesome-icons.mjs
// Clones the Font Awesome repo to /tmp/fontawesome on first run (idempotent —
// skips IDs already present in icons.js).

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_JS = join(ROOT, 'src/data/icons.js')
const FA_DIR = '/tmp/fontawesome'

// Curated batch, chosen for FA's clean geometric strengths and to fill gaps the
// ornate game-icons set and the MDI batch don't cover well.
// { file: '<fa-name>.svg', id, label, group }. IDs are prefixed `fa-`.
// Starter sampling — a small cross-section to gauge FA's fit before a fuller
// batch. Prefixed `fa-`.
const MANIFEST = [
  // ── Heraldic / Crowns ──
  { file: 'crown.svg',                 id: 'fa-crown',          label: 'Crown (Bold)',    group: 'Crowns' },
  { file: 'shield-halved.svg',         id: 'fa-shield-halved',  label: 'Party Shield',    group: 'Heraldic' },

  // ── Emblems / Shapes ──
  { file: 'award.svg',                 id: 'fa-award',          label: 'Award',           group: 'Emblems' },
  { file: 'gem.svg',                   id: 'fa-gem',            label: 'Gem',             group: 'Shapes' },
  { file: 'heart.svg',                 id: 'fa-heart',          label: 'Heart',           group: 'Shapes' },

  // ── Celestial / Nature ──
  { file: 'bolt.svg',                  id: 'fa-bolt',           label: 'Lightning Bolt',  group: 'Celestial' },
  { file: 'fire.svg',                  id: 'fa-fire',           label: 'Fire',            group: 'Nature' },

  // ── Beasts / Birds ──
  { file: 'dragon.svg',                id: 'fa-dragon',         label: 'Dragon',          group: 'Mythical' },
  { file: 'cat.svg',                   id: 'fa-cat',            label: 'Cat',             group: 'Beasts' },
  { file: 'paw.svg',                   id: 'fa-paw',            label: 'Paw Print',       group: 'Beasts' },
  { file: 'dove.svg',                  id: 'fa-dove',           label: 'Dove (Flight)',   group: 'Birds' },

  // ── Maritime / Industrial ──
  { file: 'anchor.svg',                id: 'fa-anchor',         label: 'Anchor (Bold)',   group: 'Maritime' },
  { file: 'hammer.svg',                id: 'fa-hammer',         label: 'Hammer',          group: 'Industrial' },

  // ── Symbols (new group — abstract & cultural marks) ──
  { file: 'peace.svg',                 id: 'fa-peace',          label: 'Peace',           group: 'Symbols' },
  { file: 'yin-yang.svg',              id: 'fa-yin-yang',       label: 'Yin Yang',        group: 'Symbols' },
  { file: 'skull.svg',                 id: 'fa-skull',          label: 'Skull',           group: 'Symbols' },
]

function ensureRepo() {
  if (existsSync(FA_DIR)) return
  console.log('Cloning Font Awesome repo to', FA_DIR, '…')
  execSync(`git clone --depth 1 https://github.com/FortAwesome/Font-Awesome.git ${FA_DIR}`, { stdio: 'inherit' })
}

function extractViewBox(svg) {
  const m = svg.match(/viewBox="([^"]+)"/)
  if (!m) return null
  const parts = m[1].trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null
  return [parts[2], parts[3]]
}

// FA solid SVGs carry exactly one shape <path>; grab its `d`.
function extractPaths(svg) {
  const ds = []
  const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/g
  let m
  while ((m = re.exec(svg)) !== null) {
    ds.push(m[1].trim())
  }
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

function main() {
  ensureRepo()

  const src = readFileSync(ICONS_JS, 'utf8')
  const existingIds = new Set([...src.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]))

  const entries = []
  let skipped = 0

  for (const item of MANIFEST) {
    if (existingIds.has(item.id)) {
      console.warn(`skip (id exists): ${item.id}`)
      skipped++
      continue
    }
    const svgPath = join(FA_DIR, 'svgs/solid', item.file)
    if (!existsSync(svgPath)) {
      console.warn(`skip (file missing): ${item.file}`)
      skipped++
      continue
    }
    const svg = readFileSync(svgPath, 'utf8')
    const viewBox = extractViewBox(svg)
    if (!viewBox) {
      console.warn(`skip (no viewBox): ${item.file}`)
      skipped++
      continue
    }
    const paths = extractPaths(svg)
    if (paths.length === 0) {
      console.warn(`skip (no shape paths): ${item.file}`)
      skipped++
      continue
    }
    entries.push(formatEntry(item, viewBox, paths))
  }

  if (entries.length === 0) {
    console.log('Nothing to import.')
    return
  }

  const marker = /\n\]\s*\n\s*export const iconsById/
  if (!marker.test(src)) throw new Error('Could not find icons array close marker in icons.js')

  const block = `\n\n  // ── Imported from Font Awesome Free — Solid (CC BY 4.0) ──\n${entries.join('\n')}\n`
  const out = src.replace(marker, `${block}]\n\nexport const iconsById`)
  writeFileSync(ICONS_JS, out)

  console.log(`\nImported ${entries.length} icons (${skipped} skipped).`)
  console.log('Source: https://fontawesome.com (Font Awesome Free, CC BY 4.0)')
}

main()
