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

  // Shield / heraldic — reference image set
  {
    id: 'sh-classic',
    label: 'Classic',
    path: 'M 22,18 L 178,18 L 178,148 C 178,193 144,217 100,227 C 56,217 22,193 22,148 Z',
  },
  {
    id: 'sh-notched',
    label: 'Notched Corners',
    path: 'M 22,44 Q 22,18 46,18 L 154,18 Q 178,18 178,44 L 178,152 C 178,194 144,217 104,227 L 100,221 L 96,227 C 56,217 22,194 22,152 Z',
  },
  {
    id: 'sh-ornate',
    label: 'Ornate Top',
    path: 'M 18,42 C 18,24 34,14 54,21 C 70,12 86,22 100,22 C 114,22 130,12 146,21 C 166,14 182,24 182,42 L 182,158 C 182,198 146,220 100,228 C 54,220 18,198 18,158 Z',
  },
  {
    id: 'sh-waisted',
    label: 'Waisted',
    path: 'M 22,18 L 178,18 C 160,58 132,178 100,226 C 68,178 40,58 22,18 Z',
  },
  {
    id: 'sh-wide',
    label: 'Wide',
    path: 'M 10,22 L 190,22 L 190,148 C 190,194 150,218 100,228 C 50,218 10,194 10,148 Z',
  },
  {
    id: 'sh-tall',
    label: 'Tall',
    path: 'M 48,18 L 152,18 L 152,162 C 152,200 128,220 100,228 C 72,220 48,200 48,162 Z',
  },
  {
    id: 'sh-arch',
    label: 'Arch Top',
    path: 'M 22,46 C 22,30 40,24 58,27 C 72,20 86,15 100,13 C 114,15 128,20 142,27 C 160,24 178,30 178,46 L 178,155 C 178,196 145,218 100,228 C 55,218 22,196 22,155 Z',
  },
  {
    id: 'sh-gothic',
    label: 'Gothic Arch',
    path: 'M 22,54 C 22,36 38,26 56,32 C 72,20 88,12 100,8 C 112,12 128,20 144,32 C 162,26 178,36 178,54 L 178,158 C 178,198 145,220 100,228 C 55,220 22,198 22,158 Z',
  },
  {
    id: 'sh-barrel',
    label: 'Barrel',
    path: 'M 30,22 L 170,22 C 195,55 197,115 172,165 C 152,198 130,215 100,228 C 70,215 48,198 28,165 C 3,115 5,55 30,22 Z',
  },
  {
    id: 'sh-pointed-arch',
    label: 'Pointed Arch',
    path: 'M 3,35 C 41,35 73,24 100,0 C 126,23 156,34 191,35 C 194,35 198,39 198,41 C 204,102 198,159 152,207 C 140,218 125,226 112,236 C 104,242 97,240 88,236 C 40,211 15,171 5,122 C -1,94 -2,65 3,35 Z',
  },
  {
    id: 'sh-cat-ear',
    label: 'Cat Ear',
    path: 'M 0,0 C 106,26 109,20 200,0 L 200,163 C 196,193 168,218 100,240 C 32,218 4,193 0,163 Z',
  },
  // Circular / oval
  {
    id: 'circular',
    label: 'Circle',
    path: 'M 0,120 A 100,100 0 0 1 200,120 A 100,100 0 0 1 0,120 Z',
    arcFit: { cx: 100, cy: 120, rx: 100, ry: 100 },
  },
  {
    id: 'oval-portrait',
    label: 'Oval Portrait',
    path: 'M 20,120 A 80,105 0 0 1 180,120 A 80,105 0 0 1 20,120 Z',
    arcFit: { cx: 100, cy: 120, rx: 80, ry: 105 },
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
