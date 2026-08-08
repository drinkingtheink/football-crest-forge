# Crest Foundry — Claude Code Context

Club crest creator app. Users design crests/badges for any kind of club — football/soccer first, but also scholastic, recreational, intramural, social, role-playing, and more — by combining shield shapes, heraldic symbols, background fills, text, and borders, then export them as PNG or SVG.

## Stack

- **Vue 3 + Vite** (no TypeScript)
- **Plain scoped CSS** — no utility framework. Tailwind was explicitly rejected. Global resets in `src/style.css`, component styles in `<style scoped>`.
- **`@vueuse/core`** — used for composable utilities
- **`opentype.js`** — SVG export text→outline (lazy-loaded only on export). Reads WOFF v1; fonts pulled from Fontsource/jsDelivr.
- No backend yet (Phase 2: Supabase for save/share/gallery)

## Phase 2 — Export pipeline

### PNG + SVG export (SHIPPED) — `src/utils/exportBadge.js`
Both formats start from `buildCleanCrestSvg(svgEl)`: clones the live badge `<svg>`, strips `[data-export-hide]` layers (shimmer/depth/guides/size-hint/hit-test, tagged in `BadgeComposer.vue`), drops the drop-shadow filter. Transparent background, viewBox `0 0 200 240`.
- **PNG** (`exportCrestPng`): embeds used fonts as base64 `@font-face` (`embedFont` — Google Fonts CSS **subsetted to used glyphs** via `&text=`), then rasterizes the clone via `<img>`→canvas, ~1600×1920.
- **SVG** (`exportCrestSvg`): converts every `<text>` to **vector outlines** ("Create Outlines") so the file has **zero font dependency** — a print shop needs no fonts, Illustrator/RIP-safe. `outlineTexts` measures per-glyph placement on the live element via the SVG DOM APIs `getStartPositionOfChar` / `getRotationOfChar` (these handle straight *and* curved textPath/arc text uniformly), and replaces each `<text>` with a `<g>` of `<path>` glyph outlines from opentype.js. Fallback: any font that fails to load stays as `<text>` with its font embedded.
- **Fonts for outlining**: opentype.js (lazy `import()`, only on SVG export) reads **WOFF v1** natively, so `loadFontForOutline` fetches each family+weight as a static WOFF from **Fontsource on jsDelivr** (`@fontsource/<slug>/files/<slug>-latin-<weight>-normal.woff`; slug = lowercased family, spaces→hyphens). Real per-weight files → **correct bold** (no woff2/variable-font problems). All 56 app fonts resolve; weight falls back 700→400 if a weight is missing. `data-text-id` on the badge `<text>` elements matches live↔clone.
- Verified in-browser: exported SVG has 0 `<text>`, 0 `@font-face`; straight + arc text render correctly as a bare `file://` with no app/network/fonts. Blackletter (UnifrakturMaguntia) and serif outlines match on-screen.
- Filenames via `crestFilename(texts, ext)` → always `crest-foundry-<slug>.<ext>`. Toolbar "⬇ PNG" / "⬇ SVG" (`App.vue`), guarded by `isExporting`.

### Text stroke (SHIPPED)
- `strokeColor` + `strokeWidth` (0 = off) on each text object, mirroring symbol stroke. Config default in `DEFAULT_TEXT()`; UI is the "Outline" row in `TextEditor.vue`.
- Rendered on straight *and* arc `<text>` in `BadgeComposer.vue` with `paint-order="stroke fill"` (stroke behind fill). Unlike symbols, text stroke-width is in badge viewBox units directly (text isn't scaled like icons), so no viewBox-scaling helper.
- **Browser + PNG**: automatic (browser honours `paint-order` natively, canvas rasterisation picks it up).
- **SVG export with outlining**: `outlineTexts` sets `stroke`/`stroke-width`/`paint-order` on the outlined glyph `<g>`. Critical ordering: `flattenPaintOrder` runs *after* `outlineTexts` (not before) — otherwise the live `<text>`'s `paint-order` gets split into two `<text>` copies before outlining, leaving a stray un-outlined text with an embedded font. Fallback (font load failed) text keeps `paint-order` and is flattened as `<text>`.

## Architecture

### File layout

```
src/
  components/
    BadgeComposer.vue   # SVG renderer + drag handling ONLY
    IconPicker.vue      # Heraldic symbol gallery (emits add-icon)
    TextEditor.vue      # Text element list + editing controls
    ClubPicker.vue      # Searchable dropdown of preset club palettes (emits apply)
    ColorPicker.vue     # Reusable swatch + native color input (emits change)
    FontPicker.vue      # In-font font picker w/ lazy load + live hover preview
    SnapshotPanel.vue   # Save/load/delete grid for stored designs
    ToastContainer.vue  # Teleported toast queue (success/tip/quota errors)
    AboutModal.vue      # ⓘ modal — icon attribution (game-icons CC BY authors)
    AppBackground.vue   # Animated page backdrop (bokeh + spark particles)
    LogoMark.vue        # Animated Crest Foundry logo mark
  composables/
    useBadgeConfig.js   # All reactive badge state + mutations
    useToast.js         # Global reactive toast queue (addToast/dismiss)
  data/
    shapes.js           # SVG shield shape path definitions (VIEWBOX: 200×240)
    icons.js            # heraldic SVG icons (single fill; viewBox 0 0 100 100, or per-icon `viewBox: [w, h]`)
    clubs.js            # ~88 preset real-club palettes ({ id, name, colors: [{ name, hex }] })
  utils/
    arcPath.js          # Pure fn: generates SVG arc path string for textPath
    exportBadge.js      # PNG + SVG export (shared clean-SVG builder + font embedding)
    fonts.js            # Font registry + lazy Google Fonts loader (promise-based; EB Garamond pre-loaded in index.html)
    snapshots.js        # localStorage persistence for saved designs (+ PNG thumbnail)
    bokeh.js            # Pure canvas fn: palette-tinted bokeh backdrop
    particles.js        # Pure fn: foundry spark field (emit/burst/float)
    patterns.js         # Pure fns: CSS background styles (aurora/waves/crisscross)
  App.vue               # Layout shell + wires composable to components
  style.css             # Global reset only
```

### Component responsibilities

**`BadgeComposer.vue`** — takes `config` prop, renders layered SVG, emits drag events. Rule: no business logic, no export logic, no font loading. If it doesn't touch SVG rendering or drag, it doesn't belong here.

**`useBadgeConfig.js`** — single source of truth for badge state. All mutations go through functions exported from this composable. `App.vue` calls these; components emit events upward.

**`IconPicker.vue`** — pure gallery. Clicking an icon emits `add-icon` with the icon ID. No state.

**`TextEditor.vue`** — owns the text element list UI. Emits `add-text`, `remove-text`, `update-text`, `select-text` upward.

### Config object shape

```js
config = {
  shapeId: 'traditional-english',
  noShield: false,              // "No Badge" mode — no shield, symbols unclipped, no drop-shadow
  palette: ['#1a3a6b', ...],    // 1–6 hex colors; single source for swatches + colour remap
  background: {
    type: 'halved-v',           // solid|halved-v|halved-h|quartered|diagonal|chevron|sash|
                                //   striped-v|striped-h|striped-diagonal|checkered|saltire|
                                //   sunburst|gradient|radial
    stripeCount,                // 2–16, for striped-*/checkered/saltire
    sashWidth,                  // 68–280, sash band width
    sunburstRays,               // 6–48 (even), sunburst wedge count
    gradient: ['#..', '#..'],   // 2–5 editable stops (gradient + radial fills)
    gradientAngle,              // 0–359 deg, linear gradient direction
  },
  symbols: [
    // { instanceId, iconId, color, x, y, size,
    //   rotation, flipH, strokeColor, strokeWidth, clipped,
    //   ringThickness }        // only when the icon has supportsRing
  ],
  texts: [
    {
      id, content, fontFamily, fontWeight, fontSize, color,
      strokeColor, strokeWidth, // text outline (0 = off); mirrors symbol stroke, paint-order stroke fill
      letterSpacing,            // px, number
      rotation,                 // deg (straight text only)
      arc,                      // null | 'top' | 'bottom' | 'arch'
      arcRx, arcRy, arcX, arcY, // arc ellipse params (used when arc !== null)
      archHeight,               // arch-mode curvature (arc === 'arch')
      x, y,                     // used when arc === null (straight, draggable)
    }
  ],
  border: { color, width },
}
```

Symbols carry stroke (`strokeColor`/`strokeWidth`, rendered `paint-order="stroke fill"`), `rotation`, `flipH`, and `clipped` (default true; `false` = "free" symbol rendered unclipped, may extend past bounds). Icons may declare `supportsRing: true` + `defaultRingThickness`; such symbols get a `ringThickness` and render as a ring/annulus (or chevron band when `thicknessShape === 'chevron'`).

**Clubs & boot state**: `data/clubs.js` holds preset real-club palettes; `ClubPicker` emits `apply` → `setPalette`, which remaps existing symbol/border/gradient colours to the nearest new palette entry. The app boots with a random club palette, random background type, and one random symbol.

**Snapshots**: `snapshots.js` persists deep-cloned configs + a PNG thumbnail to `localStorage` (`crest-foundry:snap:<id>`, reads legacy `crest-forge:` keys too); throws a `QUOTA`-coded error when full. `SnapshotPanel` is the save/load/delete UI; `useToast`/`ToastContainer` surface success and quota errors.

### SVG coordinate system

- Badge viewBox: `0 0 200 240`
- Icon viewBox: `0 0 100 100` — all icons use a single fill color (no multi-color)
- Arc text uses `<textPath href="#arcpath-{uid}-{id}">` referencing paths in `<defs>`
- Circle path formula used throughout: `M cx,cy-r A r,r 0 1 0 cx,cy+r A r,r 0 1 0 cx,cy-r Z`

### Drag system

`BadgeComposer` handles all drag via `createSVGPoint` + `getScreenCTM().inverse()` for coordinate conversion. `beginDrag(e, type, id)` is the shared mousedown handler for symbols and text. Drag state is `{ type, id, targets: [{type,id,ox,oy,isArc}], px, py, moved, collapse }`. Straight text is draggable; arc text is not (positioned via sidebar sliders). Group-drag: if the pressed element is part of a multi-selection, `targets` is the whole selection (moved together, selection preserved); a plain click on a grouped element (mousedown without movement) collapses to just that one on mouseup.

### Selection & alignment (multi-select)

Selection lives in `useBadgeConfig` as a single ordered array `selection = [{ type: 'symbol'|'text', id }]`. `selectedSymbolId`/`selectedTextId` are **read-only computed shims** that resolve only when exactly one element of that type is selected — so all single-select consumers (expanded editors, keyboard nudge/delete, symbol controls, auto-scroll) behave as before. Helpers: `isSelected(type, id)`, `toggleSelection(type, id)`, plus `setSelection`/`clearSelection`/`removeFromSelection` used internally by the mutators.

- **Interaction**: shift/⌘-click an element (canvas or sidebar row) toggles membership; a plain click replaces. Selected elements get a cyan glow on canvas (`SELECT_GLOW` in `BadgeComposer`; stripped from exports by the element-filter pass in `buildCleanCrestSvg`). Arrow-nudge and Delete act on the whole selection.
- **Align toolbar** (`App.vue`): a contextual bar over the stage, appears at ≥2 alignable elements; 6 ops (left/h-center/right/top/v-center/bottom) align to the selection bounding box. At ≥3, two **Distribute** buttons equalise the gaps between adjacent edges along an axis (endpoints held). `selectionBoxes()` measures each element — symbols by their size box, straight text by a live `getBBox()` — and `moveBox()` writes new positions via the centre anchors. **Arc text is excluded** (its anchor is a circle centre, not a linear edge) and doesn't count toward the toolbar threshold.

### Welding-spark hover effect

On a sustained *idle* hover over the crest (nothing selected, not dragging), a weld head laps the shield outline once, spitting a dense spark trail that hugs the edge on a canvas **behind** the crest, then pauses before the next pass. Driven from `App.vue` (rAF + lap/cooldown state machine) using `BadgeComposer.outlinePointAt(t)` (point + outward normal + travel tangent in screen space) and `particles.js`' `weld()` emitter. Canvas-only, so exports are untouched; skipped in No-Shield mode and under reduced motion. Tunable constants (`EDGE_SPARK_DELAY`, `WELD_LAP_MS`, `WELD_COOLDOWN`, `WELD_EMIT`) at the top of the welding block.

### Auto-scroll pattern

When `selectedSymbolId` or `selectedTextId` changes (the single-select shims above), `App.vue` scrolls the corresponding sidebar row into view:
```js
watch(selectedId, async (id) => {
  await nextTick()
  rowRefs[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})
```
Dynamic refs collected via `:ref="el => setRowRef(el, id)"`.

## Conventions

- **No comments** unless the WHY is non-obvious
- **No Tailwind** — plain CSS, scoped per component
- **Commit after each logical feature**, not at end of session
- **Utils are pure functions** — no Vue imports in `src/utils/`
- New icons: add to `src/data/icons.js`, same `{ id, label, group, paths[] }` shape, viewBox `0 0 100 100`
- New shapes: add to `src/data/shapes.js`, same `{ id, label, group, path }` shape, viewBox `0 0 200 240`

## Icons

Icons live in `src/data/icons.js` as `{ id, label, group, paths[] }`, single fill color, viewBox `0 0 100 100` — or an optional per-icon `viewBox: [w, h]` for icons authored at a different scale (both `IconPicker.vue` and `BadgeComposer.vue` read this array and fall back to `100×100`).

Most icons (those with `gi-` IDs) are imported from [game-icons.net](https://game-icons.net) via `scripts/import-game-icons.mjs` — an authoring tool, **not** a runtime dependency. It shallow-clones the icon repo to `/tmp`, strips the background rect, and bakes the shape paths into `icons.js` as `viewBox: [512, 512]` entries. To pull more: add rows to the script's `MANIFEST` and run `node scripts/import-game-icons.mjs` (it's idempotent — skips IDs already present).

game-icons are **CC BY 3.0**, which requires attribution. Credited authors are listed in `src/components/AboutModal.vue` (shown via the ⓘ button). When importing icons from a new author folder, add that author to the modal's `iconAuthors` list.

## Dark theme palette

| Token | Value | Use |
|---|---|---|
| App background | `#0f0f13` | Page bg |
| Panel bg | `#13131a` | Controls pane |
| Item bg | `#1e1e28` | Buttons, inputs |
| Expanded bg | `#191922` | Expanded rows |
| Border | `#2a2a35` | Dividers, input borders |
| Text primary | `#e8e8ec` | Body text |
| Text muted | `#888` | Labels |
| Text dim | `#555` | Hints |
| Accent | `#e8c84a` | Active states, logo |
| Danger | `#e05555` | Remove buttons on hover |
