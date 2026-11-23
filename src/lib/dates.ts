// YAML dates are UTC midnight, so always read them back in UTC.
const pad = (n: number) => String(n).padStart(2, '0');

/** 2026-11-23 → "2026·11·23" */
export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}·${pad(d.getUTCMonth() + 1)}·${pad(d.getUTCDate())}`;
}

/** For <time datetime> and URLs: "2026-11-23" */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "2026-11" → "2026·11" */
export function formatMonth(ym: string): string {
  return ym.replace('-', '·');
}
