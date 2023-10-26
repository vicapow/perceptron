export default function round(a: number) {
  return Math.round(a * 100) / 100;
}

export function pad(number: number): string {
  return number.toFixed(2);
}
