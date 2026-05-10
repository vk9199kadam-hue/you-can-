export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean>
  | ClassValue[];

function flatten(input: ClassValue, out: string[]) {
  if (!input) return;
  if (typeof input === "string" || typeof input === "number") {
    out.push(String(input));
    return;
  }
  if (Array.isArray(input)) {
    for (const v of input) flatten(v, out);
    return;
  }
  for (const [k, v] of Object.entries(input)) {
    if (v) out.push(k);
  }
}

export function cn(...values: ClassValue[]) {
  const out: string[] = [];
  for (const v of values) flatten(v, out);
  return out.join(" ");
}

