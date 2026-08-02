/**
 * 300° arc paths for <textPath> arc text.
 *
 * A single large-arc command with non-antipodal endpoints eliminates all
 * arc-direction ambiguity. Both paths are symmetric about the vertical axis
 * so that startOffset="50%" lands exactly at the apex (top or bottom).
 *
 * Top arc  — CW 300°: from lower-left (120°) → left → TOP (270°) → right → lower-right (60°)
 *   50% = top,    path direction at apex = rightward → text reads L→R
 *
 * Bottom arc — CCW 300°: from upper-left (240°) → left → BOTTOM (90°) → right → upper-right (300°)
 *   50% = bottom, path direction at apex = rightward → text reads L→R
 *
 * Arc length ≈ 5.24r, which dwarfs any text length at reasonable font sizes.
 */
export function arcPathD(text) {
  const r  = text.arcRadius ?? 78
  const cx = text.arcX ?? 100
  const cy = text.arcY ?? 120
  const s  = Math.sqrt(3) / 2   // sin(60°) ≈ 0.866

  if (text.arc === 'top') {
    const x0 = cx - r * 0.5,  y0 = cy + r * s   // 120° — lower-left
    const x1 = cx + r * 0.5,  y1 = cy + r * s   // 60°  — lower-right
    return `M ${x0},${y0} A ${r},${r} 0 1 1 ${x1},${y1}`
  } else {
    const x0 = cx - r * 0.5,  y0 = cy - r * s   // 240° — upper-left
    const x1 = cx + r * 0.5,  y1 = cy - r * s   // 300° — upper-right
    return `M ${x0},${y0} A ${r},${r} 0 1 0 ${x1},${y1}`
  }
}
