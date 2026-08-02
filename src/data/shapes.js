export const VIEWBOX_W = 200
export const VIEWBOX_H = 240

export const shapes = [
  // Shield / heraldic
  {
    id: 'traditional-english',
    label: 'Traditional English',
    path: 'M 15,15 L 185,15 L 185,145 C 185,190 145,215 100,225 C 55,215 15,190 15,145 Z',
  },
  {
    id: 'pointed-heraldic',
    label: 'Pointed Heraldic',
    path: 'M 15,15 L 185,15 L 185,150 L 100,225 L 15,150 Z',
  },
  {
    id: 'heater-wide',
    label: 'Wide Heater',
    path: 'M 8,35 L 192,35 L 192,155 C 192,195 150,218 100,226 C 50,218 8,195 8,155 Z',
  },
  {
    id: 'tall-narrow',
    label: 'Tall Narrow',
    path: 'M 55,15 L 145,15 L 145,165 C 145,200 125,220 100,228 C 75,220 55,200 55,165 Z',
  },
  {
    id: 'chevron-bottom',
    label: 'Chevron Bottom',
    path: 'M 15,15 L 185,15 L 185,170 L 100,218 L 15,170 Z',
  },
  {
    id: 'rounded-rect',
    label: 'Rounded Rectangle',
    path: 'M 30,18 Q 15,18 15,33 L 15,207 Q 15,222 30,222 L 170,222 Q 185,222 185,207 L 185,33 Q 185,18 170,18 Z',
  },

  // Circular / oval
  {
    id: 'circular',
    label: 'Circle',
    path: 'M 0,120 A 100,100 0 0 1 200,120 A 100,100 0 0 1 0,120 Z',
  },
  {
    id: 'oval-portrait',
    label: 'Oval Portrait',
    path: 'M 20,120 A 80,105 0 0 1 180,120 A 80,105 0 0 1 20,120 Z',
  },

  // Geometric
  {
    id: 'octagonal',
    label: 'Octagonal',
    path: 'M 65,15 L 135,15 L 185,65 L 185,162 L 135,212 L 65,212 L 15,162 L 15,65 Z',
  },
  {
    id: 'hexagonal',
    label: 'Hexagonal',
    path: 'M 100,12 L 182,58 L 182,175 L 100,221 L 18,175 L 18,58 Z',
  },
  {
    id: 'pennant',
    label: 'Pennant',
    path: 'M 15,15 L 185,15 L 185,178 L 100,225 L 15,178 Z',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    path: 'M 100,12 L 188,120 L 100,228 L 12,120 Z',
  },
]

export const shapesById = Object.fromEntries(shapes.map(s => [s.id, s]))
