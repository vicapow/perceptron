export default function subscript(i: number): string {
  return i
    .toString()
    .split("")
    .map((digit) => String.fromCharCode(8320 + parseInt(digit)))
    .join("");
}
