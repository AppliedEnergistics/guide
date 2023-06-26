export function guiScaledDimension(value: number) {
  return `calc(${value}px * var(--gui-scale))`;
}
