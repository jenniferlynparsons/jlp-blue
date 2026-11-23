// Pure helpers for Now versions. No Astro imports, so node:test can run them directly.

export interface NowSnapshot {
  reading: { title: string }[];
  watching: { title: string }[];
  links: { title: string }[];
  quote?: { text: string };
  making: string[];
  into: string[];
  changes?: string[];
}

/** Plain text of a markdown heading: drops [link](url) syntax and emphasis marks. */
const plain = (s: string) =>
  s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();

/** The ### headings under "## Making" and "## Into lately". */
export function nowHeadings(body = ''): { making: string[]; into: string[] } {
  const out = { making: [] as string[], into: [] as string[] };
  let section: keyof typeof out | null = null;
  for (const line of body.split('\n')) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      const name = plain(h2[1]).toLowerCase();
      section = name === 'making' ? 'making' : name === 'into lately' ? 'into' : null;
      continue;
    }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3 && section) out[section].push(plain(h3[1]));
  }
  return out;
}

const key = (s: string) => s.trim().toLowerCase();

function diff(curr: string[], prev: string[], add: string, remove: string): string[] {
  const c = new Set(curr.map(key));
  const p = new Set(prev.map(key));
  return [
    ...curr.filter((t) => !p.has(key(t))).map((t) => `+ ${add}${t.trim()}`),
    ...prev.filter((t) => !c.has(key(t))).map((t) => `− ${remove}${t.trim()}`),
  ];
}

const titles = (xs: { title: string }[]) => xs.map((x) => x.title);

/** What changed from `prev` to `curr`. Returns [] for the first version (no prev). */
export function nowChanges(curr: NowSnapshot, prev?: NowSnapshot): string[] {
  if (curr.changes?.length) return curr.changes;
  if (!prev) return [];
  const lines = [
    ...diff(titles(curr.reading), titles(prev.reading), 'reading ', 'reading '),
    ...diff(titles(curr.watching), titles(prev.watching), 'watched ', 'watched '),
    ...diff(titles(curr.links), titles(prev.links), 'link ', 'link '),
    ...diff(curr.making, prev.making, 'making: ', 'making: '),
    ...diff(curr.into, prev.into, 'into: ', 'into: '),
  ];
  const q = curr.quote?.text.trim();
  if (q && q !== prev.quote?.text.trim()) lines.push('~ new quote');
  return lines;
}
