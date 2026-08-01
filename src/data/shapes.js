export const VIEWBOX_W = 200
export const VIEWBOX_H = 240

export const shapes = [
  // Classic / Heraldic
  {
    id: 'traditional-english',
    label: 'Traditional English',
    group: 'Classic / Heraldic',
    path: 'M 15,15 L 185,15 L 185,145 C 185,190 145,215 100,225 C 55,215 15,190 15,145 Z',
  },
  {
    id: 'pointed-heraldic',
    label: 'Pointed Heraldic',
    group: 'Classic / Heraldic',
    path: 'M 15,15 L 185,15 L 185,150 L 100,225 L 15,150 Z',
  },
  {
    id: 'round-arch',
    label: 'Round Arch',
    group: 'Classic / Heraldic',
    path: 'M 100,15 C 60,15 15,50 15,95 L 15,155 L 100,225 L 185,155 L 185,95 C 185,50 140,15 100,15 Z',
  },
  {
    id: 'scudetto',
    label: 'Scudetto',
    group: 'Classic / Heraldic',
    path: 'M 15,65 C 15,25 55,12 100,22 C 145,12 185,25 185,65 L 185,155 L 100,225 L 15,155 Z',
  },
  {
    id: 'german-rounded',
    label: 'German Rounded',
    group: 'Classic / Heraldic',
    path: 'M 15,95 A 85,80 0 0 1 185,95 L 185,170 L 125,170 L 100,198 L 75,170 L 15,170 Z',
  },
  {
    id: 'spanish-escudo',
    label: 'Spanish Escudo',
    group: 'Classic / Heraldic',
    path: 'M 100,15 C 55,15 15,52 15,97 L 15,172 Q 55,220 100,225 Q 145,220 185,172 L 185,97 C 185,52 145,15 100,15 Z',
  },
  {
    id: 'heater-wide',
    label: 'Wide Heater',
    group: 'Classic / Heraldic',
    path: 'M 8,35 L 192,35 L 192,155 C 192,195 150,218 100,226 C 50,218 8,195 8,155 Z',
  },
  {
    id: 'tall-narrow',
    label: 'Tall Narrow',
    group: 'Classic / Heraldic',
    path: 'M 55,15 L 145,15 L 145,165 C 145,200 125,220 100,228 C 75,220 55,200 55,165 Z',
  },

  // Circular / Oval
  {
    id: 'circular',
    label: 'Circle',
    group: 'Circular / Oval',
    path: 'M 0,120 A 100,100 0 0 1 200,120 A 100,100 0 0 1 0,120 Z',
  },
  {
    id: 'oval-portrait',
    label: 'Oval Portrait',
    group: 'Circular / Oval',
    path: 'M 20,120 A 80,105 0 0 1 180,120 A 80,105 0 0 1 20,120 Z',
  },
  {
    id: 'oval-landscape',
    label: 'Oval Landscape',
    group: 'Circular / Oval',
    path: 'M 5,115 A 95,78 0 0 1 195,115 A 95,78 0 0 1 5,115 Z',
  },
  {
    id: 'vintage-oval',
    label: 'Vintage Oval',
    group: 'Circular / Oval',
    path: 'M 50,15 A 50,50 0 0 0 50,215 L 150,215 A 50,50 0 0 0 150,15 Z',
  },

  // Modern
  {
    id: 'modern-rounded',
    label: 'Modern Rounded',
    group: 'Modern',
    path: 'M 35,15 Q 15,15 15,35 L 15,150 C 15,192 55,216 100,225 C 145,216 185,192 185,150 L 185,35 Q 185,15 165,15 Z',
  },
  {
    id: 'flat-bottom',
    label: 'Flat Bottom',
    group: 'Modern',
    path: 'M 100,18 C 58,13 15,42 15,85 L 15,200 L 185,200 L 185,85 C 185,42 142,13 100,18 Z',
  },
  {
    id: 'rounded-rect',
    label: 'Rounded Rectangle',
    group: 'Modern',
    path: 'M 30,18 Q 15,18 15,33 L 15,207 Q 15,222 30,222 L 170,222 Q 185,222 185,207 L 185,33 Q 185,18 170,18 Z',
  },
  {
    id: 'chevron-bottom',
    label: 'Chevron Bottom',
    group: 'Modern',
    path: 'M 15,15 L 185,15 L 185,170 L 100,218 L 15,170 Z',
  },

  // Vintage / Specialty
  {
    id: 'octagonal',
    label: 'Octagonal',
    group: 'Vintage / Specialty',
    path: 'M 65,15 L 135,15 L 185,65 L 185,162 L 135,212 L 65,212 L 15,162 L 15,65 Z',
  },
  {
    id: 'hexagonal',
    label: 'Hexagonal',
    group: 'Vintage / Specialty',
    path: 'M 100,12 L 182,58 L 182,175 L 100,221 L 18,175 L 18,58 Z',
  },
  {
    id: 'pennant',
    label: 'Pennant',
    group: 'Vintage / Specialty',
    path: 'M 15,15 L 185,15 L 185,178 L 100,225 L 15,178 Z',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    group: 'Vintage / Specialty',
    path: 'M 100,12 L 188,120 L 100,228 L 12,120 Z',
  },
]

export const shapesById = Object.fromEntries(shapes.map(s => [s.id, s]))
export const shapeGroups = [...new Set(shapes.map(s => s.group))]
