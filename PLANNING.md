# Crest Forge — Feature Roadmap

> Live planning document. Update this when features are completed or priorities shift.

---

## Done

- [x] **Project scaffold** — Vue 3 + Vite, plain CSS, no Tailwind
- [x] **20 shield shapes** — 4 groups (Classic/Heraldic, Circular/Oval, Modern, Vintage/Specialty); 200×240 viewBox
- [x] **~35 heraldic icons** — 7 categories; `{ id, label, group, paths[] }`; viewBox 0 0 100 100
- [x] **Badge compositor** (`BadgeComposer.vue`) — SVG-layered rendering, clipPath per shape
- [x] **Background fills** — solid, halved-v, halved-h, quartered, diagonal, striped-v, striped-h; 2-color picker
- [x] **Border** — color + thickness
- [x] **Multi-symbol support** — add multiple instances from icon gallery, each with own color + size + position
- [x] **Symbol drag** — drag to reposition within badge (SVG coordinate conversion)
- [x] **Text system** — add/remove text elements; per-text: content, font size, weight, color, letter spacing
- [x] **Arc text** — Straight / Arc top / Arc bottom modes; arc radius + vertical position sliders
- [x] **Text drag** — straight text draggable on canvas
- [x] **Layout** — badge fixed in viewport center; only controls pane scrolls; no header
- [x] **Auto-scroll sidebar** — selecting symbol/text in badge scrolls corresponding sidebar row into view
- [x] **`src/utils/arcPath.js`** — pure arc path calculation extracted from BadgeComposer
- [x] **`CLAUDE.md`** — project context loaded in every session
- [x] **Git history** — 3 commits pushed to `github.com/drinkingtheink/football-crest-forge`

---

## Up Next

### 1. Font picker (next session priority)

**Goal:** Per-text font selection from a curated set of ~45–60 Google Fonts, previewed live in the badge.

**Files:**
- `src/utils/fonts.js` — font registry + lazy Google Fonts loader
- `src/components/TextEditor.vue` — add font selector UI to expanded text row
- `BadgeComposer.vue` — `font-family` already threaded through; no changes needed

**Design decisions:**

| Decision | Choice |
|---|---|
| Font loading | Lazy via Google Fonts `<link>` injected once per font on first use |
| In-editor preview | Live via injected stylesheet (works as soon as `<link>` loads) |
| Export | `opentype.js` fetches font TTF, converts text to `<path>` outlines (no font dep on SVG file) |
| Font count | ~45–60 across 7 categories |

**Font categories (target fonts per category):**

| Category | Target fonts | Examples |
|---|---|---|
| Blackletter / Old English | 6–8 | UnifrakturMaguntia, MedievalSharp, Cinzel Decorative |
| Bold Condensed Gothic | 6–8 | Oswald, Barlow Condensed, Anton, Big Shoulders Display |
| Slab Serif | 6–8 | Rockwell-style → Arvo, Roboto Slab, Zilla Slab |
| Classic Serif | 6–8 | EB Garamond, Playfair Display, Cormorant |
| Script / Retro | 6–8 | Pacifico, Lobster, Abril Fatface |
| Military / Stencil | 4–6 | Teko, Special Elite, Bebas Neue |
| Modern Geometric | 6–8 | Rajdhani, Exo 2, Orbitron |

**Implementation steps:**
1. Write `fonts.js`: export `fontGroups`, `fontById`, `loadFont(family)` async fn
2. Add font dropdown/picker to expanded text row in `TextEditor.vue`
3. Call `loadFont` on select (inject `<link rel="stylesheet" href="...">` to `<head>` if not already loaded)
4. `DEFAULT_TEXT()` in `useBadgeConfig.js` gets `fontFamily: 'EB Garamond'` default

---

### 2. SVG + PNG export

**Goal:** Download badge as clean SVG (with text converted to outlines) or PNG at 2×/4× scale.

**File:** `src/utils/exportBadge.js`

**SVG export strategy:**
1. Clone the live SVG DOM node
2. For each `<text>` element, use `opentype.js` to fetch the TTF (cached), convert string to path, replace `<text>` with `<path>`
3. Remove `<defs>` entries that reference font names
4. Serialize to string, trigger download

**PNG export strategy:**
1. Serialize SVG → blob URL
2. Draw onto `<canvas>` at target resolution (e.g., 800×960 for 4×)
3. `canvas.toBlob('image/png')` → trigger download

**Font TTF cache:** module-level `Map<family, ArrayBuffer>` — fetch once, reuse

**opentype.js:** `npm install opentype.js` — ~100KB, tree-shakeable

**Export button location:** Below the badge in `preview-pane` (not in sidebar)

---

### 3. Export UI (buttons in preview pane)

Two buttons beneath the badge:
- "Download SVG" — outlines text, triggers SVG download
- "Download PNG" — renders to canvas at 4×, triggers PNG download

---

### 4. Multi-select & group move (deferred — revisit later)

**Goal:** Select multiple elements — symbols, text, or a mix — and move them together.

**Why it's a real change, not a quick add:** the app is built around single selection. `selectedSymbolId` and `selectedTextId` are single refs, and selecting one clears the other. The drag system (`drag.value` in `BadgeComposer`) holds exactly one element; `onMove` emits a position update for that one thing. Arrow-key nudge, delete, and the sidebar expanded editor all read those single refs.

**Proposed approach:**
- Replace the two single selection refs with two Sets (`selectedSymbolIds`, `selectedTextIds`) in `useBadgeConfig.js`. Mixed symbol+text selection falls out for free. Add computed single-value fallbacks so the sidebar editor and copy/paste keep working when exactly one item is selected.
- **Group drag:** on drag start, capture the start position of every selected item, then apply the same `dx/dy` to all in `onMove`. Handles the three existing position modes transparently (symbol `x/y`, straight-text `x/y`, arc-text `arcX/arcY`).
- Extend arrow-key nudge and delete to loop over the sets.
- Add an on-canvas selection outline for selected elements (ties into the existing "No selection ring rendered" polish item below) — needed so the group is visible.
- Collapse the sidebar per-item expanded editor to an "N selected" state when 2+ are selected.

**Interaction model:** not yet decided (shift+click vs. marquee box). Pick before building.

**Scope for first pass:** move + arrow-nudge + delete only. **Multi-item copy/paste is explicitly out of scope** for the first pass (clipboard rework); keep copy/paste single.

---

## Phase 2 (future — requires Supabase)

- [ ] **Save badge** — serialize `config` as JSON → Supabase row → return short ID
- [ ] **Share via URL** — `crestforge.io/b/ABC123` → loads config by short ID
- [ ] **Public gallery** — browsable grid of public badges
- [ ] **Remix** — "Edit this badge" from gallery → fork config into editor
- [ ] **User accounts** — optional; needed for "my badges" view

**Backend:** Supabase (Postgres + Storage + Auth). No backend until Phase 2.

---

## Known Issues / Polish TODO

- [ ] Arc text is not clipped to the shield shape (renders outside badge boundary)
- [ ] No selection ring rendered on selected symbol in SVG
- [ ] Weight picker only has Normal/Bold — should include 100–900 numeric weights for fonts that support them
- [ ] `vintage-oval` shape still needs visual QA
- [ ] No undo/redo
- [ ] No keyboard shortcut to remove selected element (Delete key)
- [ ] Mobile layout not considered (controls pane too narrow on small screens)

---

## Architectural Guardrails

- `BadgeComposer.vue` = SVG + drag only. Never add business logic or font loading here.
- `src/utils/*` = pure functions, no Vue imports.
- `useBadgeConfig.js` = all state + mutations. Components emit → App calls composable.
- Commit after each completed feature, not at end of session.
- No Tailwind. Plain scoped CSS per component.
