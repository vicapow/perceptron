export type Point = [number, number];

// // Example usage:
// const p0: Point = [0, 0];
// const p1: Point = [50, 100];
// const p2: Point = [150, 100];
// const p3: Point = [200, 0];
// const t: number = 0.5; // Interpolation value between 0 and 1

// const result: Point = interpolateBezier(p0, p1, p2, p3, t);
// console.log(result); // The interpolated point at t = 0.5

export function interpolateBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  // De Casteljau's algorithm
  const q0 = lerp(p0, p1, t);
  const q1 = lerp(p1, p2, t);
  const q2 = lerp(p2, p3, t);

  const r0 = lerp(q0, q1, t);
  const r1 = lerp(q1, q2, t);

  const interpolatedPoint = lerp(r0, r1, t);
  return interpolatedPoint;
}

function lerp(start: Point, end: Point, t: number): Point {
  return [start[0] * (1 - t) + end[0] * t, start[1] * (1 - t) + end[1] * t];
}
