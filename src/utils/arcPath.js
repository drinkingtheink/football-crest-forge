/**
 * Returns the SVG `d` string for a semicircular arc used by <textPath>.
 * Top arc: CW sweep through the top of the circle (text reads along the top).
 * Bottom arc: CCW sweep through the bottom (text reads along the bottom).
 */
export function arcPathD(text) {
  const r  = text.arcRadius ?? 78
  const cx = text.arcX ?? 100
  const cy = text.arcY ?? 120
  const sweep = text.arc === 'top' ? 1 : 0
  return `M ${cx - r},${cy} A ${r},${r} 0 0 ${sweep} ${cx + r},${cy}`
}
