export const fontGroups = [
  'Blackletter',
  'Gothic',
  'Slab Serif',
  'Classic Serif',
  'Script',
  'Military',
  'Modern',
]

export const fonts = [
  // Blackletter
  { family: 'UnifrakturMaguntia', group: 'Blackletter' },
  { family: 'Cinzel Decorative',  group: 'Blackletter' },
  { family: 'Jim Nightshade',     group: 'Blackletter' },
  { family: 'Uncial Antiqua',     group: 'Blackletter' },
  { family: 'Almendra Display',   group: 'Blackletter' },
  { family: 'Grenze Gotisch',     group: 'Blackletter' },
  // Gothic / Bold Condensed
  { family: 'Oswald',               group: 'Gothic' },
  { family: 'Barlow Condensed',     group: 'Gothic' },
  { family: 'Anton',                group: 'Gothic' },
  { family: 'Big Shoulders Display',group: 'Gothic' },
  { family: 'Squada One',           group: 'Gothic' },
  { family: 'Fjalla One',           group: 'Gothic' },
  { family: 'Pathway Gothic One',   group: 'Gothic' },
  // Slab Serif
  { family: 'Arvo',         group: 'Slab Serif' },
  { family: 'Roboto Slab',  group: 'Slab Serif' },
  { family: 'Zilla Slab',   group: 'Slab Serif' },
  { family: 'Bitter',       group: 'Slab Serif' },
  { family: 'Crete Round',  group: 'Slab Serif' },
  { family: 'Alfa Slab One',group: 'Slab Serif' },
  { family: 'Patua One',    group: 'Slab Serif' },
  // Classic Serif
  { family: 'EB Garamond',        group: 'Classic Serif' },
  { family: 'Playfair Display',   group: 'Classic Serif' },
  { family: 'Cormorant Garamond', group: 'Classic Serif' },
  { family: 'Merriweather',       group: 'Classic Serif' },
  { family: 'Libre Baskerville',  group: 'Classic Serif' },
  { family: 'Lora',               group: 'Classic Serif' },
  { family: 'Crimson Text',       group: 'Classic Serif' },
  // Script / Retro
  { family: 'Pacifico',          group: 'Script' },
  { family: 'Lobster',           group: 'Script' },
  { family: 'Abril Fatface',     group: 'Script' },
  { family: 'Permanent Marker',  group: 'Script' },
  { family: 'Satisfy',           group: 'Script' },
  { family: 'Dancing Script',    group: 'Script' },
  { family: 'Righteous',         group: 'Script' },
  // Military / Stencil
  { family: 'Teko',              group: 'Military' },
  { family: 'Special Elite',     group: 'Military' },
  { family: 'Bebas Neue',        group: 'Military' },
  { family: 'Russo One',         group: 'Military' },
  { family: 'Saira Stencil One', group: 'Military' },
  { family: 'Graduate',          group: 'Military' },
  // Modern Geometric
  { family: 'Rajdhani',     group: 'Modern' },
  { family: 'Exo 2',        group: 'Modern' },
  { family: 'Orbitron',     group: 'Modern' },
  { family: 'Titillium Web',group: 'Modern' },
  { family: 'Audiowide',    group: 'Modern' },
  { family: 'Play',         group: 'Modern' },
  { family: 'Michroma',     group: 'Modern' },
]

export const fontsByGroup = Object.fromEntries(
  fontGroups.map(g => [g, fonts.filter(f => f.group === g)])
)

const loaded = new Set()

export function loadFont(family) {
  if (loaded.has(family)) return
  loaded.add(family)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400;700;900&display=swap`
  document.head.appendChild(link)
}
