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

  // ══ Batch 2 ══════════════════════════════════════════════════════════════

  // ── Mythical (new group) ──
  { file: 'delapouite/griffin-symbol.svg', id: 'gi-griffin',   label: 'Griffin',        group: 'Mythical' },
  { file: 'delapouite/unicorn.svg',     id: 'gi-unicorn',      label: 'Unicorn',        group: 'Mythical' },
  { file: 'skoll/pegasus.svg',          id: 'gi-pegasus',      label: 'Pegasus',        group: 'Mythical' },
  { file: 'lorc/minotaur.svg',          id: 'gi-minotaur',     label: 'Minotaur',       group: 'Mythical' },
  { file: 'delapouite/centaur.svg',     id: 'gi-centaur',      label: 'Centaur',        group: 'Mythical' },
  { file: 'lorc/hydra.svg',             id: 'gi-hydra',        label: 'Hydra',          group: 'Mythical' },
  { file: 'lorc/sea-serpent.svg',       id: 'gi-sea-serpent',  label: 'Sea Serpent',    group: 'Mythical' },

  // ── Beasts ──
  { file: 'lorc/ram.svg',               id: 'gi-ram',          label: 'Ram',            group: 'Beasts' },
  { file: 'skoll/cobra.svg',            id: 'gi-cobra',        label: 'Cobra',          group: 'Beasts' },
  { file: 'lorc/snake.svg',             id: 'gi-snake',        label: 'Snake',          group: 'Beasts' },
  { file: 'lorc/scorpion.svg',          id: 'gi-scorpion',     label: 'Scorpion',       group: 'Beasts' },
  { file: 'lorc/octopus.svg',           id: 'gi-octopus',      label: 'Octopus',        group: 'Beasts' },
  { file: 'delapouite/elephant-head.svg', id: 'gi-elephant-head', label: 'Elephant Head', group: 'Beasts' },
  { file: 'lorc/shark-jaws.svg',        id: 'gi-shark',        label: 'Shark',          group: 'Beasts' },

  // ── Emblems (new group) ──
  { file: 'lorc/ribbon.svg',            id: 'gi-ribbon',       label: 'Ribbon',         group: 'Emblems' },
  { file: 'lorc/scroll-unfurled.svg',   id: 'gi-scroll',       label: 'Scroll',         group: 'Emblems' },
  { file: 'delapouite/fleur-de-lys.svg', id: 'gi-fleur-de-lis', label: 'Fleur-de-lis',  group: 'Emblems' },
  { file: 'caro-asercion/heraldic-sun.svg', id: 'gi-heraldic-sun', label: 'Heraldic Sun', group: 'Emblems' },
  { file: 'delapouite/flag-objective.svg', id: 'gi-flag',      label: 'Flag',           group: 'Emblems' },
  { file: 'lorc/winged-emblem.svg',     id: 'gi-winged-emblem', label: 'Winged Emblem', group: 'Emblems' },

  // ── Weapons ──
  { file: 'lorc/crossed-swords.svg',    id: 'gi-crossed-swords', label: 'Crossed Blades', group: 'Weapons' },
  { file: 'lorc/battle-axe.svg',        id: 'gi-battle-axe',   label: 'Battle Axe',     group: 'Weapons' },
  { file: 'delapouite/two-handed-sword.svg', id: 'gi-greatsword', label: 'Greatsword',  group: 'Weapons' },
  { file: 'lorc/winged-sword.svg',      id: 'gi-winged-sword', label: 'Winged Sword',   group: 'Weapons' },
  { file: 'lorc/scythe.svg',            id: 'gi-scythe',       label: 'Scythe',         group: 'Weapons' },

  // ── Industrial ──
  { file: 'sbed/wrench.svg',            id: 'gi-wrench',       label: 'Wrench',         group: 'Industrial' },
  { file: 'lorc/screwdriver.svg',       id: 'gi-screwdriver',  label: 'Screwdriver',    group: 'Industrial' },
  { file: 'delapouite/sickle.svg',      id: 'gi-sickle',       label: 'Sickle',         group: 'Industrial' },
  { file: 'delapouite/pitchfork.svg',   id: 'gi-pitchfork',    label: 'Pitchfork',      group: 'Industrial' },

  // ── Sport ──
  { file: 'delapouite/soccer-ball.svg', id: 'gi-soccer-ball',  label: 'Soccer Ball',    group: 'Sport' },
  { file: 'lorc/trophy.svg',            id: 'gi-trophy',       label: 'Trophy',         group: 'Sport' },
  { file: 'delapouite/whistle.svg',     id: 'gi-whistle',      label: 'Whistle',        group: 'Sport' },
  { file: 'lorc/boots.svg',             id: 'gi-boots',        label: 'Boots',          group: 'Sport' },
  { file: 'lorc/medal.svg',             id: 'gi-medal',        label: 'Medal',          group: 'Sport' },
  { file: 'lorc/stopwatch.svg',         id: 'gi-stopwatch',    label: 'Stopwatch',      group: 'Sport' },
  { file: 'delapouite/podium.svg',      id: 'gi-podium',       label: 'Podium',         group: 'Sport' },

  // ── Heraldic ──
  { file: 'sbed/key.svg',               id: 'gi-key',          label: 'Key',            group: 'Heraldic' },
  { file: 'lorc/hand.svg',              id: 'gi-hand',         label: 'Hand',           group: 'Heraldic' },
  { file: 'lorc/fist.svg',              id: 'gi-fist',         label: 'Fist',           group: 'Heraldic' },
  { file: 'lorc/open-book.svg',         id: 'gi-open-book',    label: 'Open Book',      group: 'Heraldic' },
  { file: 'delapouite/torch.svg',       id: 'gi-torch',        label: 'Torch',          group: 'Heraldic' },

  // ── Nature (new group) ──
  { file: 'lorc/mountains.svg',         id: 'gi-mountains',    label: 'Mountains',      group: 'Nature' },
  { file: 'lorc/mountaintop.svg',       id: 'gi-mountaintop',  label: 'Mountain Peak',  group: 'Nature' },

  // ══ Batch 3 ══════════════════════════════════════════════════════════════

  // ── Beasts ──
  { file: 'delapouite/tiger-head.svg',  id: 'gi-tiger',        label: 'Tiger',          group: 'Beasts' },
  { file: 'lorc/hound.svg',             id: 'gi-hound',        label: 'Hound',          group: 'Beasts' },

  // ── Birds ──
  { file: 'lorc/dove.svg',              id: 'gi-dove',         label: 'Dove',           group: 'Birds' },
  { file: 'delapouite/seagull.svg',     id: 'gi-seagull',      label: 'Seagull',        group: 'Birds' },
  { file: 'delapouite/crane.svg',       id: 'gi-crane',        label: 'Crane',          group: 'Birds' },
  { file: 'caro-asercion/heron.svg',    id: 'gi-heron',        label: 'Heron',          group: 'Birds' },
  { file: 'delapouite/falcon-moon.svg', id: 'gi-falcon',       label: 'Falcon',         group: 'Birds' },

  // ── Maritime ──
  { file: 'lorc/galleon.svg',           id: 'gi-galleon',      label: 'Galleon',        group: 'Maritime' },
  { file: 'delapouite/caravel.svg',     id: 'gi-caravel',      label: 'Caravel',        group: 'Maritime' },
  { file: 'delapouite/drakkar.svg',     id: 'gi-drakkar',      label: 'Longship',       group: 'Maritime' },
  { file: 'delapouite/ship-bow.svg',    id: 'gi-ship-bow',     label: 'Ship Bow',       group: 'Maritime' },

  // ── Flora ──
  { file: 'delapouite/shamrock.svg',    id: 'gi-shamrock',     label: 'Shamrock',       group: 'Flora' },
  { file: 'lorc/pine-tree.svg',         id: 'gi-pine-tree',    label: 'Pine Tree',      group: 'Flora' },
  { file: 'delapouite/palm-tree.svg',   id: 'gi-palm-tree',    label: 'Palm Tree',      group: 'Flora' },
  { file: 'delapouite/fern.svg',        id: 'gi-fern',         label: 'Fern',           group: 'Flora' },
  { file: 'lorc/grapes.svg',            id: 'gi-grapes',       label: 'Grapes',         group: 'Flora' },
  { file: 'delapouite/corn.svg',        id: 'gi-corn',         label: 'Corn',           group: 'Flora' },
  { file: 'lorc/sprout.svg',            id: 'gi-sprout',       label: 'Sprout',         group: 'Flora' },
  { file: 'delapouite/vines.svg',       id: 'gi-vines',        label: 'Vines',          group: 'Flora' },

  // ── Buildings ──
  { file: 'delapouite/church.svg',      id: 'gi-church',       label: 'Church',         group: 'Buildings' },
  { file: 'delapouite/watchtower.svg',  id: 'gi-watchtower',   label: 'Watchtower',     group: 'Buildings' },
  { file: 'delapouite/house.svg',       id: 'gi-house',        label: 'House',          group: 'Buildings' },
  { file: 'delapouite/obelisk.svg',     id: 'gi-obelisk',      label: 'Obelisk',        group: 'Buildings' },
  { file: 'delapouite/barn.svg',        id: 'gi-barn',         label: 'Barn',           group: 'Buildings' },

  // ── Weapons ──
  { file: 'lorc/crossed-axes.svg',      id: 'gi-crossed-axes', label: 'Crossed Axes',   group: 'Weapons' },
  { file: 'lorc/crossed-sabres.svg',    id: 'gi-crossed-sabres', label: 'Crossed Sabres', group: 'Weapons' },
  { file: 'lorc/cannon.svg',            id: 'gi-cannon',       label: 'Cannon',         group: 'Weapons' },
  { file: 'carl-olsen/crossbow.svg',    id: 'gi-crossbow',     label: 'Crossbow',       group: 'Weapons' },
  { file: 'delapouite/katana.svg',      id: 'gi-katana',       label: 'Katana',         group: 'Weapons' },
  { file: 'delapouite/flail.svg',       id: 'gi-flail',        label: 'Flail',          group: 'Weapons' },

  // ── Heraldic ──
  { file: 'delapouite/horseshoe.svg',   id: 'gi-horseshoe',    label: 'Horseshoe',      group: 'Heraldic' },

  // ── Nature ──
  { file: 'lorc/volcano.svg',           id: 'gi-volcano',      label: 'Volcano',        group: 'Nature' },
  { file: 'lorc/tornado.svg',           id: 'gi-tornado',      label: 'Tornado',        group: 'Nature' },
  { file: 'delapouite/island.svg',      id: 'gi-island',       label: 'Island',         group: 'Nature' },
  { file: 'sbed/water-drop.svg',        id: 'gi-water-drop',   label: 'Water Drop',     group: 'Nature' },
  { file: 'lorc/snowflake-1.svg',       id: 'gi-snowflake',    label: 'Snowflake',      group: 'Nature' },
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
