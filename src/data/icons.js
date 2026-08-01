// All icons use a 0 0 100 100 viewBox and render with a single fill color.
// Circle formula used throughout: M cx,cy-r A r,r 0 1 0 cx,cy+r A r,r 0 1 0 cx,cy-r Z

export const icons = [

  // ── Celestial ──────────────────────────────────────────────────────────────
  {
    id: 'star-4',
    label: '4-Point Star',
    group: 'Celestial',
    paths: ['M 50,5 L 61,39 L 95,50 L 61,61 L 50,95 L 39,61 L 5,50 L 39,39 Z'],
  },
  {
    id: 'star-5',
    label: '5-Point Star',
    group: 'Celestial',
    paths: ['M 50,5 L 61,35 L 93,64 L 67,56 L 76,86 L 50,68 L 24,86 L 33,56 L 7,64 L 39,35 Z'],
  },
  {
    id: 'star-6',
    label: '6-Point Star',
    group: 'Celestial',
    paths: [
      'M 50,6 L 90,72 L 10,72 Z',
      'M 50,94 L 10,28 L 90,28 Z',
    ],
  },
  {
    id: 'star-8',
    label: '8-Point Star',
    group: 'Celestial',
    paths: ['M 50,5 L 58,32 L 82,18 L 68,42 L 95,50 L 68,58 L 82,82 L 58,68 L 50,95 L 42,68 L 18,82 L 32,58 L 5,50 L 32,42 L 18,18 L 42,32 Z'],
  },
  {
    id: 'crescent',
    label: 'Crescent',
    group: 'Celestial',
    paths: ['M 50,10 C 76,10 88,28 88,50 C 88,72 76,90 50,90 C 62,78 68,65 68,50 C 68,35 62,22 50,10 Z'],
  },
  {
    id: 'sun',
    label: 'Sun',
    group: 'Celestial',
    // 8-pointed starburst — no inner hole needed, just a bold star shape with rounded center implied
    paths: ['M 50,5 L 56,30 L 74,14 L 65,37 L 92,34 L 72,50 L 92,66 L 65,63 L 74,86 L 56,70 L 50,95 L 44,70 L 26,86 L 35,63 L 8,66 L 28,50 L 8,34 L 35,37 L 26,14 L 44,30 Z'],
  },
  {
    id: 'comet',
    label: 'Comet',
    group: 'Celestial',
    paths: [
      'M 65,8 A 18,18 0 1 0 65,44 A 18,18 0 1 0 65,8 Z',
      'M 52,34 L 5,52 L 8,60 L 56,42 Z',
      'M 50,40 L 5,68 L 10,74 L 56,48 Z',
      'M 52,28 L 8,14 L 12,22 L 56,36 Z',
    ],
  },

  // ── Heraldic ───────────────────────────────────────────────────────────────
  {
    id: 'cross-greek',
    label: 'Greek Cross',
    group: 'Heraldic',
    paths: ['M 35,8 L 65,8 L 65,35 L 92,35 L 92,65 L 65,65 L 65,92 L 35,92 L 35,65 L 8,65 L 8,35 L 35,35 Z'],
  },
  {
    id: 'cross-latin',
    label: 'Latin Cross',
    group: 'Heraldic',
    paths: ['M 40,8 L 60,8 L 60,38 L 88,38 L 88,58 L 60,58 L 60,92 L 40,92 L 40,58 L 12,58 L 12,38 L 40,38 Z'],
  },
  {
    id: 'saltire',
    label: 'Saltire',
    group: 'Heraldic',
    paths: ['M 14,8 L 50,38 L 86,8 L 92,14 L 62,50 L 92,86 L 86,92 L 50,62 L 14,92 L 8,86 L 38,50 L 8,14 Z'],
  },
  {
    id: 'chevron',
    label: 'Chevron',
    group: 'Heraldic',
    paths: ['M 8,85 L 50,22 L 92,85 L 80,92 L 50,42 L 20,92 Z'],
  },
  {
    id: 'fleur-de-lis',
    label: 'Fleur-de-lis',
    group: 'Heraldic',
    paths: [
      // central petal
      'M 50,8 C 62,8 70,20 70,36 C 70,48 62,56 50,58 C 38,56 30,48 30,36 C 30,20 38,8 50,8 Z',
      // left petal
      'M 30,58 C 20,58 10,65 8,74 C 6,82 12,88 20,86 C 28,84 35,76 37,67 L 40,58 Z',
      // right petal
      'M 70,58 C 80,58 90,65 92,74 C 94,82 88,88 80,86 C 72,84 65,76 63,67 L 60,58 Z',
      // collar
      'M 34,55 L 66,55 L 66,65 L 34,65 Z',
      // stem
      'M 44,65 L 44,84 C 44,88 47,92 50,92 C 53,92 56,88 56,84 L 56,65 Z',
    ],
  },
  {
    id: 'lozenge',
    label: 'Lozenge',
    group: 'Heraldic',
    paths: ['M 50,5 L 92,50 L 50,95 L 8,50 Z'],
  },
  {
    id: 'roundel',
    label: 'Roundel',
    group: 'Heraldic',
    paths: ['M 50,8 A 42,42 0 1 0 50,92 A 42,42 0 1 0 50,8 Z'],
  },

  // ── Crowns & Regalia ───────────────────────────────────────────────────────
  {
    id: 'crown',
    label: 'Crown',
    group: 'Crowns',
    paths: [
      'M 10,80 L 10,46 L 28,60 L 38,20 L 50,52 L 62,20 L 72,60 L 90,46 L 90,80 Z',
      'M 8,80 L 92,80 L 92,90 L 8,90 Z',
    ],
  },
  {
    id: 'crown-imperial',
    label: 'Imperial Crown',
    group: 'Crowns',
    paths: [
      'M 12,80 L 12,50 L 26,62 L 36,24 L 50,54 L 64,24 L 74,62 L 88,50 L 88,80 Z',
      'M 8,80 L 92,80 L 92,90 L 8,90 Z',
      // cross on top
      'M 46,8 L 54,8 L 54,20 L 60,20 L 60,28 L 54,28 L 54,40 L 46,40 L 46,28 L 40,28 L 40,20 L 46,20 Z',
    ],
  },
  {
    id: 'laurel-wreath',
    label: 'Laurel Wreath',
    group: 'Crowns',
    paths: [
      // left branch — series of leaf shapes curving upward
      'M 50,82 C 44,78 34,70 26,58 C 22,52 20,44 22,36 C 26,40 28,48 28,56 C 32,48 30,36 24,28 C 30,30 36,40 38,50 C 38,40 36,28 30,20 C 38,22 44,34 44,46 C 44,34 42,22 38,14 C 46,18 50,32 50,46 Z',
      // right branch
      'M 50,82 C 56,78 66,70 74,58 C 78,52 80,44 78,36 C 74,40 72,48 72,56 C 68,48 70,36 76,28 C 70,30 64,40 62,50 C 62,40 64,28 70,20 C 62,22 56,34 56,46 C 56,34 58,22 62,14 C 54,18 50,32 50,46 Z',
    ],
  },
  {
    id: 'shield-small',
    label: 'Small Shield',
    group: 'Crowns',
    paths: ['M 12,12 L 88,12 L 88,58 C 88,80 70,92 50,96 C 30,92 12,80 12,58 Z'],
  },

  // ── Weapons ────────────────────────────────────────────────────────────────
  {
    id: 'sword',
    label: 'Sword',
    group: 'Weapons',
    paths: [
      // blade
      'M 47,88 L 53,88 L 54,28 L 50,8 L 46,28 Z',
      // crossguard
      'M 18,28 L 82,28 L 82,36 L 18,36 Z',
      // grip
      'M 46,36 L 54,36 L 54,58 L 46,58 Z',
      // pommel
      'M 43,58 L 57,58 L 57,68 L 43,68 Z',
    ],
  },
  {
    id: 'swords-crossed',
    label: 'Crossed Swords',
    group: 'Weapons',
    paths: [
      // blade 1 (top-left → bottom-right)
      'M 16,10 L 24,10 L 84,82 L 76,90 L 68,90 L 8,18 Z',
      // crossguard 1
      'M 10,40 L 42,20 L 46,28 L 14,48 Z',
      // blade 2 (top-right → bottom-left)
      'M 76,10 L 84,10 L 92,18 L 32,90 L 24,90 L 16,82 Z',
      // crossguard 2
      'M 90,40 L 58,20 L 54,28 L 86,48 Z',
    ],
  },
  {
    id: 'arrow-up',
    label: 'Arrow',
    group: 'Weapons',
    paths: ['M 50,5 L 65,32 L 56,28 L 56,92 L 44,92 L 44,28 L 35,32 Z'],
  },
  {
    id: 'axe',
    label: 'Battle Axe',
    group: 'Weapons',
    paths: [
      'M 46,18 L 54,18 L 54,90 L 46,90 Z',
      'M 54,20 C 72,16 86,28 86,46 C 86,64 72,74 54,70 C 60,54 60,38 54,20 Z',
    ],
  },

  // ── Beasts ─────────────────────────────────────────────────────────────────
  {
    id: 'lion',
    label: 'Lion',
    group: 'Beasts',
    paths: [
      // bold mane silhouette — thick enough to read as a lion head
      'M 50,8 C 66,6 80,14 86,28 C 92,40 90,56 82,66 C 88,74 88,84 80,90 C 72,96 62,90 56,82 C 54,86 52,90 50,90 C 48,90 46,86 44,82 C 38,90 28,96 20,90 C 12,84 12,74 18,66 C 10,56 8,40 14,28 C 20,14 34,6 50,8 Z',
      // left ear
      'M 18,20 L 12,8 L 28,18 Z',
      // right ear
      'M 82,20 L 88,8 L 72,18 Z',
    ],
  },
  {
    id: 'eagle',
    label: 'Eagle',
    group: 'Beasts',
    paths: [
      // head
      'M 50,6 A 12,12 0 1 0 50,30 A 12,12 0 1 0 50,6 Z',
      // beak
      'M 56,16 L 66,20 L 58,26 Z',
      // body + spread wings
      'M 50,26 C 54,24 58,26 60,30 L 60,38 L 90,22 L 84,42 L 66,48 L 70,62 C 76,70 74,80 66,78 L 58,66 L 54,78 L 50,82 L 46,78 L 42,66 L 34,78 C 26,80 24,70 30,62 L 34,48 L 16,42 L 10,22 L 40,38 L 40,30 C 42,26 46,24 50,26 Z',
    ],
  },
  {
    id: 'horse-head',
    label: 'Horse Head',
    group: 'Beasts',
    paths: [
      'M 62,88 C 54,92 44,92 36,86 C 28,80 26,68 30,58 L 24,50 C 16,42 14,30 18,20 C 22,10 34,8 44,12 C 48,8 56,6 66,10 C 76,14 82,26 80,38 C 80,48 74,56 66,60 L 66,72 C 70,76 72,82 70,88 Z',
      // nostril
      'M 36,74 A 5,4 0 1 0 36,82 A 5,4 0 1 0 36,74 Z',
    ],
  },
  {
    id: 'bull-head',
    label: 'Bull Head',
    group: 'Beasts',
    paths: [
      // head
      'M 50,24 C 68,24 82,36 82,50 C 82,64 68,76 50,76 C 32,76 18,64 18,50 C 18,36 32,24 50,24 Z',
      // left horn
      'M 22,36 C 14,28 8,16 14,10 C 20,6 26,14 28,24 Z',
      // right horn
      'M 78,36 C 86,28 92,16 86,10 C 80,6 74,14 72,24 Z',
      // nose ring
      'M 38,62 A 12,8 0 1 0 62,62 A 12,8 0 1 0 38,62 Z',
    ],
  },
  {
    id: 'bear',
    label: 'Bear',
    group: 'Beasts',
    paths: [
      // head
      'M 50,20 C 70,20 84,32 84,50 C 84,68 70,82 50,82 C 30,82 16,68 16,50 C 16,32 30,20 50,20 Z',
      // left ear
      'M 20,28 C 16,18 18,10 24,12 C 30,14 32,24 28,30 Z',
      // right ear
      'M 80,28 C 84,18 82,10 76,12 C 70,14 68,24 72,30 Z',
    ],
  },

  // ── Flora ──────────────────────────────────────────────────────────────────
  {
    id: 'shamrock',
    label: 'Shamrock',
    group: 'Flora',
    paths: [
      // top leaf: center (50,33), r=20
      'M 50,13 A 20,20 0 1 0 50,53 A 20,20 0 1 0 50,13 Z',
      // left leaf: center (33,55), r=20
      'M 13,55 A 20,20 0 1 0 53,55 A 20,20 0 1 0 13,55 Z',
      // right leaf: center (67,55), r=20
      'M 47,55 A 20,20 0 1 0 87,55 A 20,20 0 1 0 47,55 Z',
      // stem
      'M 47,56 L 47,90 L 53,90 L 53,56 Z',
    ],
  },
  {
    id: 'oak-leaf',
    label: 'Oak Leaf',
    group: 'Flora',
    paths: [
      'M 50,5 C 56,14 66,14 70,22 C 74,30 68,38 60,36 C 68,42 72,52 68,60 C 64,68 54,68 50,62 C 46,68 36,68 32,60 C 28,52 32,42 40,36 C 32,38 26,30 30,22 C 34,14 44,14 50,5 Z',
      'M 48,62 L 48,92 L 52,92 L 52,62 Z',
    ],
  },
  {
    id: 'rose',
    label: 'Rose',
    group: 'Flora',
    paths: [
      // outer petals
      'M 50,10 C 58,14 62,24 58,34 C 64,28 74,28 78,36 C 82,44 76,54 66,56 C 72,62 72,72 64,76 C 56,80 48,74 46,64 C 44,72 36,80 28,76 C 20,72 20,62 26,56 C 16,54 10,44 14,36 C 18,28 28,28 34,34 C 30,24 34,14 42,10 C 44,8 48,8 50,10 Z',
      // center
      'M 50,38 A 12,12 0 1 0 50,62 A 12,12 0 1 0 50,38 Z',
    ],
  },
  {
    id: 'thistle',
    label: 'Thistle',
    group: 'Flora',
    paths: [
      // bulb
      'M 50,10 C 62,10 70,20 70,32 C 70,44 62,52 50,52 C 38,52 30,44 30,32 C 30,20 38,10 50,10 Z',
      // spines on bulb
      'M 50,6 L 52,14 L 48,14 Z',
      'M 32,14 L 36,22 L 32,24 Z',
      'M 68,14 L 64,22 L 68,24 Z',
      // stem
      'M 47,52 L 47,88 L 53,88 L 53,52 Z',
      // left leaf
      'M 47,64 C 36,58 24,62 20,72 C 28,64 40,64 47,72 Z',
      // right leaf
      'M 53,72 C 60,62 72,60 78,70 C 72,62 62,62 53,70 Z',
    ],
  },
  {
    id: 'acorn',
    label: 'Acorn',
    group: 'Flora',
    paths: [
      // nut body
      'M 30,52 C 30,36 38,24 50,24 C 62,24 70,36 70,52 C 70,68 62,82 50,86 C 38,82 30,68 30,52 Z',
      // cap
      'M 26,48 C 26,38 36,30 50,30 C 64,30 74,38 74,48 L 72,54 C 72,58 62,60 50,60 C 38,60 28,58 28,54 Z',
      // stalk
      'M 48,24 L 48,14 C 48,10 52,8 56,10 C 58,12 58,16 56,18 L 52,20 L 52,24 Z',
    ],
  },

  // ── Maritime ───────────────────────────────────────────────────────────────
  {
    id: 'anchor',
    label: 'Anchor',
    group: 'Maritime',
    paths: [
      // top ring (solid circle — readable at badge scale)
      'M 50,6 A 12,12 0 1 0 50,30 A 12,12 0 1 0 50,6 Z',
      // shaft
      'M 47,26 L 47,82 L 53,82 L 53,26 Z',
      // crossbar
      'M 16,30 L 84,30 L 84,38 L 16,38 Z',
      // left arm curve
      'M 47,82 C 36,82 22,74 18,62 L 24,58 C 26,68 36,72 47,70 Z',
      // right arm curve
      'M 53,82 C 64,82 78,74 82,62 L 76,58 C 74,68 64,72 53,70 Z',
    ],
  },
  {
    id: 'trident',
    label: 'Trident',
    group: 'Maritime',
    paths: [
      // center prong
      'M 47,8 L 53,8 L 53,84 L 47,84 Z',
      // left prong
      'M 18,8 L 24,8 L 28,42 L 22,42 Z',
      // right prong
      'M 76,8 L 82,8 L 78,42 L 72,42 Z',
      // crossbar
      'M 18,42 L 82,42 L 82,48 L 18,48 Z',
      // handle base
      'M 44,84 L 56,84 L 56,94 L 44,94 Z',
    ],
  },
  {
    id: 'ship-wheel',
    label: 'Ship Wheel',
    group: 'Maritime',
    paths: [
      // 8 spokes (hub to rim)
      'M 48,10 L 52,10 L 52,90 L 48,90 Z',
      'M 10,48 L 10,52 L 90,52 L 90,48 Z',
      'M 19,19 L 22,16 L 84,78 L 81,81 Z',
      'M 81,19 L 84,22 L 22,84 L 19,81 Z',
      // outer ring (thick stroked path approximated as wide band)
      'M 50,6 A 44,44 0 1 0 50,94 A 44,44 0 1 0 50,6 Z',
      'M 50,14 A 36,36 0 1 1 50,86 A 36,36 0 1 1 50,14 Z',
      // hub
      'M 50,38 A 12,12 0 1 0 50,62 A 12,12 0 1 0 50,38 Z',
    ],
  },

  // ── Buildings ──────────────────────────────────────────────────────────────
  {
    id: 'tower',
    label: 'Tower',
    group: 'Buildings',
    paths: [
      // battlements
      'M 18,12 L 18,28 L 28,28 L 28,20 L 36,20 L 36,28 L 64,28 L 64,20 L 72,20 L 72,28 L 82,28 L 82,12 Z',
      // main body
      'M 20,28 L 80,28 L 80,90 L 20,90 Z',
      // door arch
      'M 38,90 L 38,68 C 38,58 62,58 62,68 L 62,90 Z',
      // windows
      'M 28,38 L 40,38 L 40,52 L 28,52 Z',
      'M 60,38 L 72,38 L 72,52 L 60,52 Z',
    ],
  },
  {
    id: 'castle',
    label: 'Castle',
    group: 'Buildings',
    paths: [
      // left tower battlements
      'M 4,18 L 4,28 L 10,28 L 10,22 L 16,22 L 16,28 L 26,28 L 26,18 Z',
      // left tower body
      'M 4,28 L 26,28 L 26,78 L 4,78 Z',
      // right tower battlements
      'M 74,18 L 74,28 L 84,28 L 84,22 L 90,22 L 90,28 L 96,28 L 96,18 Z',
      // right tower body
      'M 74,28 L 96,28 L 96,78 L 74,78 Z',
      // center battlements
      'M 24,28 L 24,38 L 32,38 L 32,32 L 40,32 L 40,38 L 60,38 L 60,32 L 68,32 L 68,38 L 76,38 L 76,28 Z',
      // center wall
      'M 24,38 L 76,38 L 76,90 L 24,90 Z',
      // gate arch
      'M 36,90 L 36,62 C 36,54 64,54 64,62 L 64,90 Z',
    ],
  },
  {
    id: 'portcullis',
    label: 'Portcullis',
    group: 'Buildings',
    paths: [
      // arch surround
      'M 8,92 L 8,50 C 8,28 26,10 50,10 C 74,10 92,28 92,50 L 92,92 Z',
      'M 14,92 L 14,50 C 14,32 30,16 50,16 C 70,16 86,32 86,50 L 86,92 Z',
      // horizontal bars
      'M 14,52 L 86,52 L 86,58 L 14,58 Z',
      'M 14,68 L 86,68 L 86,74 L 14,74 Z',
      // vertical bars
      'M 30,16 L 36,16 L 36,92 L 30,92 Z',
      'M 47,10 L 53,10 L 53,92 L 47,92 Z',
      'M 64,16 L 70,16 L 70,92 L 64,92 Z',
      // spikes
      'M 30,86 L 33,94 L 36,86 Z',
      'M 47,82 L 50,92 L 53,82 Z',
      'M 64,86 L 67,94 L 70,86 Z',
    ],
  },
]

export const iconsById = Object.fromEntries(icons.map(ic => [ic.id, ic]))
export const iconGroups = ['All', ...new Set(icons.map(ic => ic.group))]
