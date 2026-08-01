# Crest Forge — Claude Code Context

Football badge creator app for football enthusiasts. Users design club crests by combining shield shapes, heraldic symbols, background fills, text, and borders, then export them as PNG or SVG.

## Stack

- **Vue 3 + Vite** (no TypeScript)
- **Plain scoped CSS** — no utility framework. Tailwind was explicitly rejected. Global resets in `src/style.css`, component styles in `<style scoped>`.
- **`@vueuse/core`** — used for composable utilities
- **`opentype.js`** — planned for SVG export (text → path outlines)
- No backend yet (Phase 2: Supabase for save/share/gallery)

## Architecture

### File layout

```
src/
  components/
    BadgeComposer.vue   # SVG renderer + drag handling ONLY
    IconPicker.vue      # Heraldic symbol gallery (emits add-icon)
    TextEditor.vue      # Text element list + editing controls
  composables/
    useBadgeConfig.js   # All reactive badge state + mutations
  data/
    shapes.js           # 20 SVG shield shape path definitions (VIEWBOX: 200×240)
    icons.js            # ~35 heraldic SVG icons (VIEWBOX: 0 0 100 100, single fill)
  utils/
    arcPath.js          # Pure fn: generates SVG arc path string for textPath
    exportBadge.js      # (planned) PNG + SVG export, opentype.js outlining
    fonts.js            # (planned) Font registry + lazy Google Fonts loader
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
  background: {
    type: 'halved-v',           // solid|halved-v|halved-h|quartered|diagonal|striped-v|striped-h
    colors: ['#1a3a6b', '#c8102e'],
  },
  symbols: [
    // { instanceId, iconId, color, x, y, size }
  ],
  texts: [
    {
      id, content, fontFamily, fontWeight, fontSize, color,
      letterSpacing,            // px, number
      arc,                      // null | 'top' | 'bottom'
      arcRadius, arcX, arcY,    // arc circle params (used when arc !== null)
      x, y,                     // used when arc === null (straight, draggable)
    }
  ],
  border: { color, width },
}
```

### SVG coordinate system

- Badge viewBox: `0 0 200 240`
- Icon viewBox: `0 0 100 100` — all icons use a single fill color (no multi-color)
- Arc text uses `<textPath href="#arcpath-{uid}-{id}">` referencing paths in `<defs>`
- Circle path formula used throughout: `M cx,cy-r A r,r 0 1 0 cx,cy+r A r,r 0 1 0 cx,cy-r Z`

### Drag system

`BadgeComposer` handles all drag via `createSVGPoint` + `getScreenCTM().inverse()` for coordinate conversion. Drag state is `{ type: 'text'|'symbol', id/instanceId, sx, sy, ox, oy }`. Straight text is draggable; arc text is not (positioned via sidebar sliders).

### Auto-scroll pattern

When `selectedSymbolId` or `selectedTextId` changes, `App.vue` scrolls the corresponding sidebar row into view:
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
