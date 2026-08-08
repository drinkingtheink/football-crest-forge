#!/usr/bin/env node
// Import curated icons from Material Design Icons (Pictogrammers, Apache-2.0)
// into src/data/icons.js.
//
// MDI SVGs are the simplest possible shape: viewBox="0 0 24 24", a single
// <path d="…"/> filled with currentColor, no background rect. We keep the one
// shape path and store viewBox: [24, 24] (icons.js supports a per-icon viewBox).
//
// License: Apache-2.0 — no attribution required, but the source is noted here
// and in the app's About modal for good measure.
//
// Usage: node scripts/import-mdi-icons.mjs
// Clones the MDI SVG repo to /tmp/mdi-svg on first run (idempotent — skips IDs
// already present in icons.js).

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICONS_JS = join(ROOT, 'src/data/icons.js')
const MDI_DIR = '/tmp/mdi-svg'

// Curated batch, focused on categories the game-icons library is thin on.
// { file: '<mdi-name>.svg', id, label, group }. IDs are prefixed `mdi-`.
const MANIFEST = [
  // ── Sport (library has only a handful) ──
  { file: 'soccer.svg',              id: 'mdi-soccer',          label: 'Soccer Ball',     group: 'Sport' },
  { file: 'basketball.svg',          id: 'mdi-basketball',      label: 'Basketball',      group: 'Sport' },
  { file: 'baseball.svg',            id: 'mdi-baseball',        label: 'Baseball',        group: 'Sport' },
  { file: 'baseball-bat.svg',        id: 'mdi-baseball-bat',    label: 'Baseball Bat',    group: 'Sport' },
  { file: 'football.svg',            id: 'mdi-football',        label: 'Football',        group: 'Sport' },
  { file: 'volleyball.svg',          id: 'mdi-volleyball',      label: 'Volleyball',      group: 'Sport' },
  { file: 'tennis-ball.svg',         id: 'mdi-tennis-ball',     label: 'Tennis Ball',     group: 'Sport' },
  { file: 'tennis.svg',              id: 'mdi-tennis',          label: 'Tennis Racquet',  group: 'Sport' },
  { file: 'hockey-sticks.svg',       id: 'mdi-hockey-sticks',   label: 'Hockey Sticks',   group: 'Sport' },
  { file: 'hockey-puck.svg',         id: 'mdi-hockey-puck',     label: 'Hockey Puck',     group: 'Sport' },
  { file: 'golf.svg',                id: 'mdi-golf',            label: 'Golf',            group: 'Sport' },
  { file: 'bowling.svg',             id: 'mdi-bowling',         label: 'Bowling',         group: 'Sport' },
  { file: 'boxing-glove.svg',        id: 'mdi-boxing-glove',    label: 'Boxing Glove',    group: 'Sport' },
  { file: 'cricket.svg',             id: 'mdi-cricket',         label: 'Cricket',         group: 'Sport' },
  { file: 'rugby.svg',               id: 'mdi-rugby',           label: 'Rugby Ball',      group: 'Sport' },
  { file: 'run-fast.svg',            id: 'mdi-run',             label: 'Runner',          group: 'Sport' },
  { file: 'weight-lifter.svg',       id: 'mdi-weight-lifter',   label: 'Weightlifter',    group: 'Sport' },
  { file: 'bike.svg',                id: 'mdi-bike',            label: 'Cyclist',         group: 'Sport' },
  { file: 'swim.svg',                id: 'mdi-swim',            label: 'Swimmer',         group: 'Sport' },
  { file: 'karate.svg',              id: 'mdi-karate',          label: 'Martial Arts',    group: 'Sport' },
  { file: 'dumbbell.svg',            id: 'mdi-dumbbell',        label: 'Dumbbell',        group: 'Sport' },
  { file: 'scoreboard.svg',          id: 'mdi-scoreboard',      label: 'Scoreboard',      group: 'Sport' },
  { file: 'stadium.svg',             id: 'mdi-stadium',         label: 'Stadium',         group: 'Sport' },

  // ── Academic (new group) ──
  { file: 'school.svg',              id: 'mdi-school',          label: 'Graduation Cap',  group: 'Academic' },
  { file: 'book-open-variant.svg',   id: 'mdi-book-open',       label: 'Open Book',       group: 'Academic' },
  { file: 'bookshelf.svg',           id: 'mdi-bookshelf',       label: 'Bookshelf',       group: 'Academic' },
  { file: 'pencil.svg',              id: 'mdi-pencil',          label: 'Pencil',          group: 'Academic' },
  { file: 'fountain-pen-tip.svg',    id: 'mdi-quill',           label: 'Pen Nib',         group: 'Academic' },
  { file: 'atom.svg',                id: 'mdi-atom',            label: 'Atom',            group: 'Academic' },
  { file: 'flask.svg',               id: 'mdi-flask',           label: 'Flask',           group: 'Academic' },
  { file: 'microscope.svg',          id: 'mdi-microscope',      label: 'Microscope',      group: 'Academic' },
  { file: 'telescope.svg',           id: 'mdi-telescope',       label: 'Telescope',       group: 'Academic' },
  { file: 'math-compass.svg',        id: 'mdi-math-compass',    label: 'Compass (Draft)', group: 'Academic' },
  { file: 'palette.svg',             id: 'mdi-palette',         label: 'Palette',         group: 'Academic' },
  { file: 'brush.svg',               id: 'mdi-brush',           label: 'Paintbrush',      group: 'Academic' },
  { file: 'lightbulb-on.svg',        id: 'mdi-lightbulb',       label: 'Lightbulb',       group: 'Academic' },
  { file: 'globe-model.svg',         id: 'mdi-globe',           label: 'Globe',           group: 'Academic' },

  // ── Music (new group) ──
  { file: 'music-note.svg',          id: 'mdi-music-note',      label: 'Music Note',      group: 'Music' },
  { file: 'guitar-acoustic.svg',     id: 'mdi-guitar',          label: 'Guitar',          group: 'Music' },
  { file: 'guitar-electric.svg',     id: 'mdi-guitar-electric', label: 'Electric Guitar', group: 'Music' },
  { file: 'piano.svg',               id: 'mdi-piano',           label: 'Piano',           group: 'Music' },
  { file: 'trumpet.svg',             id: 'mdi-trumpet',         label: 'Trumpet',         group: 'Music' },
  { file: 'saxophone.svg',           id: 'mdi-saxophone',       label: 'Saxophone',       group: 'Music' },
  { file: 'violin.svg',              id: 'mdi-violin',          label: 'Violin',          group: 'Music' },
  { file: 'microphone-variant.svg',  id: 'mdi-microphone',      label: 'Microphone',      group: 'Music' },
  { file: 'headphones.svg',          id: 'mdi-headphones',      label: 'Headphones',      group: 'Music' },
  { file: 'music-clef-treble.svg',   id: 'mdi-treble-clef',     label: 'Treble Clef',     group: 'Music' },

  // ── Games (new group) ──
  { file: 'chess-king.svg',          id: 'mdi-chess-king',      label: 'Chess King',      group: 'Games' },
  { file: 'chess-queen.svg',         id: 'mdi-chess-queen',     label: 'Chess Queen',     group: 'Games' },
  { file: 'chess-knight.svg',        id: 'mdi-chess-knight',    label: 'Chess Knight',    group: 'Games' },
  { file: 'chess-rook.svg',          id: 'mdi-chess-rook',      label: 'Chess Rook',      group: 'Games' },
  { file: 'chess-bishop.svg',        id: 'mdi-chess-bishop',    label: 'Chess Bishop',    group: 'Games' },
  { file: 'chess-pawn.svg',          id: 'mdi-chess-pawn',      label: 'Chess Pawn',      group: 'Games' },
  { file: 'dice-6.svg',              id: 'mdi-dice',            label: 'Die',             group: 'Games' },
  { file: 'cards-playing-spade.svg', id: 'mdi-spade',           label: 'Spade',           group: 'Games' },
  { file: 'cards-playing-heart.svg', id: 'mdi-card-heart',      label: 'Card Heart',      group: 'Games' },
  { file: 'cards-playing-club.svg',  id: 'mdi-club',            label: 'Club (Suit)',     group: 'Games' },
  { file: 'cards-playing-diamond.svg', id: 'mdi-card-diamond',  label: 'Card Diamond',    group: 'Games' },
  { file: 'gamepad-variant.svg',     id: 'mdi-gamepad',         label: 'Gamepad',         group: 'Games' },
  { file: 'bullseye-arrow.svg',      id: 'mdi-darts',           label: 'Dartboard',       group: 'Games' },
  { file: 'puzzle.svg',              id: 'mdi-puzzle',          label: 'Puzzle Piece',    group: 'Games' },

  // ── Food & Drink (new group) ──
  { file: 'beer.svg',                id: 'mdi-beer',            label: 'Beer',            group: 'Food & Drink' },
  { file: 'glass-mug-variant.svg',   id: 'mdi-mug',            label: 'Mug',             group: 'Food & Drink' },
  { file: 'coffee.svg',              id: 'mdi-coffee',          label: 'Coffee',          group: 'Food & Drink' },
  { file: 'cup.svg',                 id: 'mdi-cup',             label: 'Cup',             group: 'Food & Drink' },
  { file: 'bottle-wine.svg',         id: 'mdi-wine',            label: 'Wine',            group: 'Food & Drink' },
  { file: 'pizza.svg',               id: 'mdi-pizza',           label: 'Pizza',           group: 'Food & Drink' },
  { file: 'hamburger.svg',           id: 'mdi-hamburger',       label: 'Burger',          group: 'Food & Drink' },
  { file: 'silverware-fork-knife.svg', id: 'mdi-fork-knife',    label: 'Fork & Knife',    group: 'Food & Drink' },
  { file: 'cupcake.svg',             id: 'mdi-cupcake',         label: 'Cupcake',         group: 'Food & Drink' },
  { file: 'ice-cream.svg',           id: 'mdi-ice-cream',       label: 'Ice Cream',       group: 'Food & Drink' },
  { file: 'food-apple.svg',          id: 'mdi-apple',           label: 'Apple',           group: 'Food & Drink' },
  { file: 'chili-mild.svg',          id: 'mdi-chili',           label: 'Chili Pepper',    group: 'Food & Drink' },
]

function ensureRepo() {
  if (existsSync(MDI_DIR)) return
  console.log('Cloning MaterialDesign-SVG repo to', MDI_DIR, '…')
  execSync(`git clone --depth 1 https://github.com/Templarian/MaterialDesign-SVG.git ${MDI_DIR}`, { stdio: 'inherit' })
}

// MDI SVGs carry exactly one shape <path>; grab its `d`.
function extractPaths(svg) {
  const ds = []
  const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/g
  let m
  while ((m = re.exec(svg)) !== null) {
    ds.push(m[1].trim())
  }
  return ds
}

function formatEntry({ id, label, group }, paths) {
  const pathsLiteral = paths.map(d => `'${d}'`).join(',\n      ')
  return `  {
    id: '${id}',
    label: '${label}',
    group: '${group}',
    viewBox: [24, 24],
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
    const svgPath = join(MDI_DIR, 'svg', item.file)
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
  }

  if (entries.length === 0) {
    console.log('Nothing to import.')
    return
  }

  const marker = /\n\]\s*\n\s*export const iconsById/
  if (!marker.test(src)) throw new Error('Could not find icons array close marker in icons.js')

  const block = `\n\n  // ── Imported from Material Design Icons (Apache-2.0) ──\n${entries.join('\n')}\n`
  const out = src.replace(marker, `${block}]\n\nexport const iconsById`)
  writeFileSync(ICONS_JS, out)

  console.log(`\nImported ${entries.length} icons (${skipped} skipped).`)
  console.log('Source: https://pictogrammers.com/library/mdi/ (Apache-2.0)')
}

main()
