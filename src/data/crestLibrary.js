// Curated crest configs surfaced during random generation. On each forge there
// is a LIBRARY_CHANCE (see App.vue) that one of these is loaded verbatim instead
// of a procedurally-generated crest, with a subtle "curated" badge.
//
// To add one: design a crest, Save Snapshot, click its { } button to copy the
// config JSON, then paste it as `config` in a new entry below with a `name`.
// Entries are frozen snapshots of the config shape — loadConfig() backfills a
// few fields, but if the config shape changes a lot you may need to touch these up.

export const crestLibrary = [
  {
    name: 'Foundry Classic',
    config: {
      shapeId: 'traditional-english',
      noShield: false,
      palette: ['#1a3a6b', '#c8102e', '#ffffff'],
      background: {
        type: 'halved-v',
        stripeCount: 4,
        sashWidth: 174,
        sunburstRays: 12,
        gradient: ['#1a3a6b', '#c8102e'],
        gradientAngle: 45,
      },
      symbols: [],
      texts: [
        {
          id: 'club-name', content: 'FOUNDRY FC',
          fontFamily: 'EB Garamond', fontWeight: 'bold', fontSize: 14, color: '#ffffff',
          strokeColor: '#000000', strokeWidth: 0, letterSpacing: 2, rotation: 0,
          arc: 'top', arcRx: 82, arcRy: 82, arcX: 100, arcY: 128, archHeight: 40, x: 100, y: 55,
        },
        {
          id: 'monogram', content: 'F',
          fontFamily: 'EB Garamond', fontWeight: 'bold', fontSize: 34, color: '#ffffff',
          strokeColor: '#000000', strokeWidth: 0, letterSpacing: 0, rotation: 0,
          arc: null, arcRx: 78, arcRy: 78, arcX: 100, arcY: 120, archHeight: 40, x: 100, y: 132,
        },
      ],
      border: { color: '#ffffff', width: 6 },
    },
  },
]
