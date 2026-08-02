/**
 * 300° arc paths for <textPath> arc text.
 *
 * A single large-arc command with non-antipodal endpoints eliminates all
 * arc-direction ambiguity. Both paths are symmetric about the vertical axis
 * so that startOffset="50%" lands exactly at the apex (top or bottom).
 *
 * Top arc  — CW 300°: from lower-left (120°) → left → TOP → right → lower-right (60°)
 *   50% = top,    path direction at apex = rightward → text reads L→R
 *
 * Bottom arc — CCW 300°: from upper-left (240°) → left → BOTTOM → right → upper-right (300°)
 *   50% = bottom, path direction at apex = rightward → text reads L→R
 *
 * Endpoints are placed at ±60° parametric angle from the apex of the ellipse:
 *   x = cx ± rx * cos(60°) = cx ± rx/2
 *   y = cy ± ry * sin(60°) = cy ± ry * √3/2
 * Symmetry about the vertical axis guarantees 50% arc-length lands at the apex
 * for both circles (rx=ry) and ellipses (rx≠ry).
 *
 * arcRx / arcRy replace the old arcRadius scalar; arcRadius is kept as a
 * fallback so legacy snapshots continue to render correctly.
 */
export function arcPathD(text) {
  const rx = text.arcRx ?? text.arcRadius ?? 78
  const ry = text.arcRy ?? text.arcRadius ?? 78
  const cx = text.arcX ?? 100
  const cy = text.arcY ?? 120
  const s  = Math.sqrt(3) / 2   // sin(60°) ≈ 0.866

  if (text.arc === 'top') {
    const x0 = cx - rx * 0.5,  y0 = cy + ry * s   // parametric 120° — lower-left
    const x1 = cx + rx * 0.5,  y1 = cy + ry * s   // parametric  60° — lower-right
    return `M ${x0},${y0} A ${rx},${ry} 0 1 1 ${x1},${y1}`
  } else {
    const x0 = cx - rx * 0.5,  y0 = cy - ry * s   // parametric 240° — upper-left
    const x1 = cx + rx * 0.5,  y1 = cy - ry * s   // parametric 300° — upper-right
    return `M ${x0},${y0} A ${rx},${ry} 0 1 0 ${x1},${y1}`
  }
}
