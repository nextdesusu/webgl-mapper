export function numberInRange(oldMin: number, oldMax: number, newMin: number, newMax: number, value: number) {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin
}