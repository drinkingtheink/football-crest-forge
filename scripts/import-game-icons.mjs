#!/usr/bin/env node
// Import curated icons from game-icons.net (CC BY 3.0) into src/data/icons.js.
//
// game-icons SVGs are a fixed shape: viewBox="0 0 512 512", a black background
// <rect> path (d="M0 0h512v512H0z") plus one or more fill="#fff" shape paths.
// We drop the background and keep the shape paths, storing viewBox: [512, 512]
// (icons.js already supports a per-icon viewBox array).
//
// Attribution: CC BY 3.0 requires crediting the authors — this script prints the
// set of authors used so they can be added to an app credits/about screen.
//
// Usage: node scripts/import-game-icons.mjs
// Clones the icon repo to /tmp/game-icons on first run.

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_JS = join(ROOT, 'src/data/icons.js')
const GI_DIR = '/tmp/game-icons'
const BG_RECT = 'M0 0h512v512H0z'

// Curated first batch. { file: 'author/name.svg', id, label, group }
const MANIFEST = [
  // ── Beasts ──
  { file: 'lorc/lion.svg',              id: 'gi-lion',        label: 'Lion',            group: 'Beasts' },
  { file: 'lorc/wolf-head.svg',         id: 'gi-wolf-head',   label: 'Wolf Head',       group: 'Beasts' },
  { file: 'lorc/bull.svg',              id: 'gi-bull',        label: 'Bull',            group: 'Beasts' },
  { file: 'lorc/horse-head.svg',        id: 'gi-horse-head',  label: 'Horse Head',      group: 'Beasts' },
  { file: 'lorc/stag-head.svg',         id: 'gi-stag-head',   label: 'Stag Head',       group: 'Beasts' },
  { file: 'caro-asercion/boar.svg',     id: 'gi-boar',        label: 'Boar',            group: 'Beasts' },
  { file: 'caro-asercion/fox.svg',      id: 'gi-fox',         label: 'Fox',             group: 'Beasts' },
  { file: 'lorc/dragon-head.svg',       id: 'gi-dragon-head', label: 'Dragon Head',     group: 'Beasts' },
  { file: 'skoll/goat.svg',             id: 'gi-goat',        label: 'Goat',            group: 'Beasts' },
  { file: 'sparker/bear-face.svg',      id: 'gi-bear',        label: 'Bear',            group: 'Beasts' },

  // ── Birds ──
  { file: 'lorc/eagle-emblem.svg',      id: 'gi-eagle-emblem', label: 'Eagle Emblem',   group: 'Birds' },
  { file: 'lorc/hawk-emblem.svg',       id: 'gi-hawk-emblem',  label: 'Hawk Emblem',    group: 'Birds' },
  { file: 'delapouite/eagle-head.svg',  id: 'gi-eagle-head',   label: 'Eagle Head',     group: 'Birds' },
  { file: 'lorc/owl.svg',               id: 'gi-owl',          label: 'Owl',            group: 'Birds' },
  { file: 'lorc/raven.svg',             id: 'gi-raven',        label: 'Raven',          group: 'Birds' },
  { file: 'lorc/swan.svg',              id: 'gi-swan',         label: 'Swan',           group: 'Birds' },
  { file: 'delapouite/rooster.svg',     id: 'gi-rooster',      label: 'Rooster',        group: 'Birds' },

  // ── Maritime ──
  { file: 'lorc/anchor.svg',            id: 'gi-anchor',       label: 'Anchor',         group: 'Maritime' },
  { file: 'lorc/trident.svg',           id: 'gi-trident',      label: 'Trident',        group: 'Maritime' },
  { file: 'delapouite/lighthouse.svg',  id: 'gi-lighthouse',   label: 'Lighthouse',     group: 'Maritime' },
  { file: 'delapouite/sailboat.svg',    id: 'gi-sailboat',     label: 'Sailboat',       group: 'Maritime' },
  { file: 'delapouite/ship-wheel.svg',  id: 'gi-ship-wheel',   label: 'Ship Wheel',     group: 'Maritime' },
  { file: 'lorc/compass.svg',           id: 'gi-compass',      label: 'Compass',        group: 'Maritime' },
  { file: 'lorc/waves.svg',             id: 'gi-waves',        label: 'Waves',          group: 'Maritime' },

  // ── Weapons ──
  { file: 'lorc/swords-emblem.svg',     id: 'gi-swords-emblem', label: 'Crossed Swords', group: 'Weapons' },
  { file: 'lorc/sword-hilt.svg',        id: 'gi-sword',         label: 'Sword',         group: 'Weapons' },
  { file: 'lorc/axe-swing.svg',         id: 'gi-axe',           label: 'Axe',           group: 'Weapons' },
  { file: 'lorc/halberd.svg',           id: 'gi-halberd',       label: 'Halberd',       group: 'Weapons' },
  { file: 'lorc/spears.svg',            id: 'gi-spears',        label: 'Spears',        group: 'Weapons' },
  { file: 'sbed/shield.svg',            id: 'gi-shield',        label: 'Shield',        group: 'Weapons' },
  { file: 'lorc/mace-head.svg',         id: 'gi-mace',          label: 'Mace',          group: 'Weapons' },

  // ── Flora ──
  { file: 'lorc/oak.svg',               id: 'gi-oak',          label: 'Oak Tree',       group: 'Flora' },
  { file: 'delapouite/oak-leaf.svg',    id: 'gi-oak-leaf',     label: 'Oak Leaf',       group: 'Flora' },
  { file: 'lorc/rose.svg',              id: 'gi-rose',         label: 'Rose',           group: 'Flora' },
  { file: 'lorc/wheat.svg',             id: 'gi-wheat',        label: 'Wheat',          group: 'Flora' },
  { file: 'sbed/clover.svg',            id: 'gi-clover',       label: 'Clover',         group: 'Flora' },
  { file: 'lorc/laurels.svg',           id: 'gi-laurels',      label: 'Laurels',        group: 'Flora' },
  { file: 'lorc/acorn.svg',             id: 'gi-acorn',        label: 'Acorn',          group: 'Flora' },

  // ── Crowns ──
  { file: 'lorc/crown.svg',             id: 'gi-crown',        label: 'Crown',          group: 'Crowns' },
  { file: 'delapouite/tiara.svg',       id: 'gi-tiara',        label: 'Tiara',          group: 'Crowns' },
  { file: 'lorc/laurel-crown.svg',      id: 'gi-laurel-crown', label: 'Laurel Crown',   group: 'Crowns' },

  // ── Buildings ──
  { file: 'delapouite/castle.svg',      id: 'gi-castle',       label: 'Castle',         group: 'Buildings' },
  { file: 'delapouite/tower-flag.svg',  id: 'gi-tower',        label: 'Tower',          group: 'Buildings' },
  { file: 'delapouite/gate.svg',        id: 'gi-gate',         label: 'Gate',           group: 'Buildings' },
  { file: 'delapouite/windmill.svg',    id: 'gi-windmill',     label: 'Windmill',       group: 'Buildings' },
  { file: 'lorc/bridge.svg',            id: 'gi-bridge',       label: 'Bridge',         group: 'Buildings' },

  // ── Industrial (new group) ──
  { file: 'lorc/gears.svg',             id: 'gi-gears',        label: 'Gears',          group: 'Industrial' },
  { file: 'lorc/anvil.svg',             id: 'gi-anvil',        label: 'Anvil',          group: 'Industrial' },
  { file: 'lorc/cog.svg',               id: 'gi-cog',          label: 'Cog',            group: 'Industrial' },
  { file: 'lorc/mining.svg',            id: 'gi-pickaxe',      label: 'Pickaxe',        group: 'Industrial' },
  { file: 'delapouite/factory.svg',     id: 'gi-factory',      label: 'Factory',        group: 'Industrial' },
  { file: 'lorc/gear-hammer.svg',       id: 'gi-gear-hammer',  label: 'Gear & Hammer',  group: 'Industrial' },
]

function ensureRepo() {
  if (existsSync(GI_DIR)) return
  console.log('Cloning game-icons repo to', GI_DIR, '…')
  execSync(`git clone --depth 1 https://github.com/game-icons/icons.git ${GI_DIR}`, { stdio: 'inherit' })
}

// Extract shape path `d` strings from a game-icons SVG, dropping the bg rect.
function extractPaths(svg) {
  const ds = []
  const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/g
  let m
  while ((m = re.exec(svg)) !== null) {
    const d = m[1].trim()
    if (d === BG_RECT) continue
    ds.push(d)
  }
  return ds
}

function formatEntry({ id, label, group }, paths) {
  const pathsLiteral = paths.map(d => `'${d}'`).join(',\n      ')
  return `  {
    id: '${id}',
    label: '${label}',
    group: '${group}',
    viewBox: [512, 512],
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
  const authors = new Set()
  let skipped = 0

  for (const item of MANIFEST) {
    if (existingIds.has(item.id)) {
      console.warn(`skip (id exists): ${item.id}`)
      skipped++
      continue
    }
    const svgPath = join(GI_DIR, item.file)
    if (!existsSync(svgPath)) {
      console.warn(`skip (file missing): ${item.file}`)
      skipped++
      continue
    }
    const paths = extractPaths(readFileSync(svgPath, 'utf8'))
    if (paths.length === 0) {
      console.warn(`skip (no shape paths): ${item.file}`)
      skipped++
      continue
    }
    entries.push(formatEntry(item, paths))
    authors.add(item.file.split('/')[0])
  }

  if (entries.length === 0) {
    console.log('Nothing to import.')
    return
  }

  // Inject before the closing `]` of the icons array.
  const marker = /\n\]\s*\n\s*export const iconsById/
  if (!marker.test(src)) throw new Error('Could not find icons array close marker in icons.js')

  const block = `\n\n  // ── Imported from game-icons.net (CC BY 3.0) ──\n${entries.join('\n')}\n`
  const out = src.replace(marker, `${block}]\n\nexport const iconsById`)
  writeFileSync(ICONS_JS, out)

  console.log(`\nImported ${entries.length} icons (${skipped} skipped).`)
  console.log(`Authors to credit (CC BY 3.0): ${[...authors].sort().join(', ')}`)
  console.log('Source: https://game-icons.net')
}

main()
