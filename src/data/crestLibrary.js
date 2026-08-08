// Curated crest configs surfaced during random generation. On each forge there
// is a LIBRARY_CHANCE (see App.vue) that one of these is loaded verbatim instead
// of a procedurally-generated crest, with a subtle "curated" badge.
//
// To add one: design a crest, Save Snapshot, click its { } button to copy the
// config JSON, then paste it as `config` in a new entry below with a `name`.
// Entries are frozen snapshots of the config shape — loadConfig() backfills a
// few fields and swaps missing icons, but if the config shape changes a lot you
// may need to touch these up.

export const crestLibrary = [
  {
    name: 'Wildwood',
    config: {
      "shapeId": "sh-wide",
      "noShield": false,
      "palette": ["#7A263A", "#1BB1E7", "#F3D459"],
      "background": { "type": "striped-diagonal", "stripeCount": 10, "sashWidth": 174, "sunburstRays": 12 },
      "symbols": [
        { "instanceId": "sym-21", "iconId": "tree-3", "color": "#F3D459", "x": 100, "y": 123.42105865478516, "size": 133, "rotation": 0, "flipH": false, "strokeColor": "#7A263A", "strokeWidth": 8, "clipped": true }
      ],
      "texts": [
        { "fontFamily": "EB Garamond", "fontWeight": "bold", "fontSize": 13, "color": "#ffffff", "letterSpacing": 2, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 100.52631378173828, "y": 41.315792083740234, "id": "club-name", "content": "FC CREST FOUNDRY" },
        { "fontFamily": "EB Garamond", "fontWeight": "normal", "fontSize": 11, "color": "#ffffff", "letterSpacing": 3, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 100.52631378173828, "y": 213.42105102539062, "id": "year", "content": "2026" }
      ],
      "border": { "color": "#F3D459", "width": 6 }
    },
  },
  {
    name: 'Azure Dragon',
    config: {
      "shapeId": "sh-wide",
      "noShield": false,
      "palette": ["#6CABDD", "#1C2C5B", "#FFC659", "#FFFFFF"],
      "background": { "type": "striped-diagonal", "stripeCount": 2, "sashWidth": 174, "sunburstRays": 12 },
      "symbols": [
        { "instanceId": "sym-16", "iconId": "dragon", "color": "#FFC659", "x": 110.64618682861328, "y": 106.96627044677734, "size": 128, "rotation": 0, "flipH": false, "strokeColor": "#1C2C5B", "strokeWidth": 10.5, "clipped": true },
        { "instanceId": "sym-17", "iconId": "star-8", "color": "#FFFFFF", "x": 44.21052551269531, "y": 57.63157653808594, "size": 49, "rotation": 0, "flipH": false, "strokeColor": "#1C2C5B", "strokeWidth": 12.5, "clipped": true }
      ],
      "texts": [
        { "fontFamily": "Righteous", "fontWeight": "bold", "fontSize": 19, "color": "#ffffff", "letterSpacing": 2, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 102.13673400878906, "y": -0.3916800022125244, "id": "club-name", "content": "CREST FOUNDRY" },
        { "fontFamily": "Righteous", "fontWeight": "normal", "fontSize": 33, "color": "#ffffff", "letterSpacing": 1.5, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 101.57894897460938, "y": 200.26315307617188, "id": "year", "content": "FC" }
      ],
      "border": { "color": "#1C2C5B", "width": 8 }
    },
  },
  {
    name: 'Red Lion',
    config: {
      "shapeId": "chevron-bottom",
      "noShield": false,
      "palette": ["#DA291C", "#000000", "#FFFFFF", "#FFE200"],
      "background": { "type": "sash", "stripeCount": 13, "sashWidth": 174, "sunburstRays": 12 },
      "symbols": [
        { "instanceId": "sym-4", "iconId": "lion-heraldic", "color": "#FFFFFF", "x": 100.10249328613281, "y": 108.76091003417969, "size": 125, "rotation": 0, "flipH": false, "strokeColor": "#DA291C", "strokeWidth": 3, "clipped": true }
      ],
      "texts": [
        { "fontFamily": "Permanent Marker", "fontWeight": "bold", "fontSize": 13, "color": "#ffffff", "letterSpacing": 2, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 102.14341735839844, "y": 33.408050537109375, "id": "club-name", "content": "FC CREST FOUNDRY" },
        { "fontFamily": "Alfa Slab One", "fontWeight": "normal", "fontSize": 11, "color": "#ffffff", "letterSpacing": 3, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 101.56475830078125, "y": 189.54074096679688, "id": "year", "content": "2026" }
      ],
      "border": { "color": "#FFFFFF", "width": 7 }
    },
  },
  {
    name: 'Golden Crown',
    config: {
      "shapeId": "sh-crown-notch",
      "noShield": false,
      "palette": ["#003090", "#FDBE11"],
      "background": { "type": "striped-diagonal", "stripeCount": 4, "sashWidth": 174, "sunburstRays": 12 },
      "symbols": [
        { "instanceId": "sym-3", "iconId": "emblem-2", "color": "#ffffff", "x": 99.1404037475586, "y": 95.43352508544922, "size": 108, "rotation": 0, "flipH": false, "strokeColor": "#003090", "strokeWidth": 4, "clipped": true }
      ],
      "texts": [
        { "fontFamily": "EB Garamond", "fontWeight": "bold", "fontSize": 22, "color": "#FDBE11", "letterSpacing": 2, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 100.36813354492188, "y": 169.89436721801758, "id": "club-name", "content": "FCCF" },
        { "fontFamily": "EB Garamond", "fontWeight": "normal", "fontSize": 11, "color": "#ffffff", "letterSpacing": 3, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 102.66461181640625, "y": 191.5027313232422, "id": "year", "content": "2026" }
      ],
      "border": { "color": "#ffffff", "width": 4.5 }
    },
  },
  {
    name: 'Flamingo Blaze',
    config: {
      "shapeId": "hexagonal",
      "noShield": false,
      "palette": ["#FEDD00", "#000000"],
      "background": { "type": "sunburst", "stripeCount": 7, "sashWidth": 174, "sunburstRays": 12 },
      "symbols": [
        { "instanceId": "sym-34", "iconId": "flamingo", "color": "#000000", "x": 102.62313842773438, "y": 126.3954086303711, "size": 126, "rotation": 0, "flipH": false, "strokeColor": "#FEDD00", "strokeWidth": 8, "clipped": true },
        { "instanceId": "sym-35", "iconId": "star-5", "color": "#ffffff", "x": 150.95665740966797, "y": 69.11499786376953, "size": 30, "rotation": 0, "flipH": false, "strokeColor": "#000000", "strokeWidth": 0, "clipped": true }
      ],
      "texts": [],
      "border": { "color": "#ffffff", "width": 0 }
    },
  },
  {
    name: 'Cosmic Gothic',
    config: {
      "shapeId": "sh-gothic",
      "noShield": false,
      "palette": ["#80000A", "#221F1F", "#A19060", "#817144"],
      "background": { "type": "radial", "stripeCount": 5, "sashWidth": 174, "sunburstRays": 12, "gradient": ["#80000A", "#221F1F"], "gradientAngle": 45 },
      "symbols": [
        { "instanceId": "sym-2", "iconId": "gi-ringed-planet", "color": "#A19060", "x": 100, "y": 123.73684692382812, "size": 170, "rotation": 0, "flipH": false, "strokeColor": "#80000A", "strokeWidth": 3, "clipped": true },
        { "instanceId": "sym-3", "iconId": "star-4", "color": "#817144", "x": 99.50037384033203, "y": 119.75469970703125, "size": 81, "rotation": 0, "flipH": false, "strokeColor": "#817144", "strokeWidth": 8.5, "clipped": true },
        { "instanceId": "sym-5", "iconId": "star-4", "color": "#ffffff", "x": 99.53248596191406, "y": 119.95089721679688, "size": 81, "rotation": 0, "flipH": false, "strokeColor": "#80000A", "strokeWidth": 0, "clipped": true }
      ],
      "texts": [
        { "fontFamily": "Metamorphous", "fontWeight": "bold", "fontSize": 13, "color": "#ffffff", "strokeColor": "#80000A", "strokeWidth": 4, "letterSpacing": 1.5, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 99.64875793457031, "y": 52.64365005493164, "id": "club-name", "content": "CREST FOUNDRY" },
        { "fontFamily": "Bungee Inline", "fontWeight": "bold", "fontSize": 22, "color": "#ffffff", "strokeColor": "#80000A", "strokeWidth": 6, "letterSpacing": 3, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 100.74543762207031, "y": 196.15660095214844, "id": "monogram", "content": "FC" },
        { "fontFamily": "Oswald", "fontWeight": "bold", "fontSize": 14, "color": "#80000A", "strokeColor": "#000000", "strokeWidth": 0, "letterSpacing": 0, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 98.96719360351562, "y": 121.59181213378906, "id": "text-4", "content": "97" }
      ],
      "border": { "color": "#A19060", "width": 5 }
    },
  },
  {
    name: 'Sovereign',
    config: {
      "shapeId": "traditional-english",
      "noShield": false,
      "palette": ["#960A2C", "#9CC2EA", "#D3D5D7", "#ffffff"],
      "background": { "type": "striped-h", "stripeCount": 4, "sashWidth": 174, "sunburstRays": 12, "gradient": ["#960A2C", "#9CC2EA"], "gradientAngle": 45 },
      "symbols": [
        { "instanceId": "sym-init", "iconId": "ss-37416", "color": "#960A2C", "x": 106.30951690673828, "y": 90.33467864990234, "size": 104, "strokeColor": "#9CC2EA", "strokeWidth": 3 },
        { "instanceId": "sym-1", "iconId": "ss-2858708", "color": "#9CC2EA", "x": 41.368980407714844, "y": 148.64679718017578, "size": 33, "rotation": 0, "flipH": false, "strokeColor": "#960A2C", "strokeWidth": 0, "clipped": true },
        { "instanceId": "sym-2", "iconId": "ss-2858708", "color": "#9CC2EA", "x": 80.44325002034506, "y": 148.64679718017578, "size": 33, "rotation": 0, "flipH": false, "strokeColor": "#960A2C", "strokeWidth": 0, "clipped": true },
        { "instanceId": "sym-3", "iconId": "ss-2858708", "color": "#9CC2EA", "x": 119.51751963297527, "y": 148.64679718017578, "size": 33, "rotation": 0, "flipH": false, "strokeColor": "#960A2C", "strokeWidth": 0, "clipped": true },
        { "instanceId": "sym-4", "iconId": "ss-2858708", "color": "#9CC2EA", "x": 158.59178924560547, "y": 148.64679718017578, "size": 33, "rotation": 0, "flipH": false, "strokeColor": "#960A2C", "strokeWidth": 0, "clipped": true }
      ],
      "texts": [
        { "fontFamily": "EB Garamond", "fontWeight": "bold", "fontSize": 13, "color": "#ffffff", "strokeColor": "#000000", "strokeWidth": 0, "letterSpacing": 2, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 103.49790954589844, "y": 39.41451644897461, "id": "club-name", "content": "CREST FOUNDRY" },
        { "fontFamily": "EB Garamond", "fontWeight": "bold", "fontSize": 22, "color": "#ffffff", "strokeColor": "#000000", "strokeWidth": 0, "letterSpacing": 3, "rotation": 0, "arc": null, "arcRx": 78, "arcRy": 78, "arcX": 100, "arcY": 120, "archHeight": 40, "x": 101.34078979492188, "y": 201.78045654296875, "id": "monogram", "content": "FC" }
      ],
      "border": { "color": "#D3D5D7", "width": 7 }
    },
  },
]
