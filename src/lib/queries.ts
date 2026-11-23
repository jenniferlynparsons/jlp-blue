import { getCollection, type CollectionEntry } from 'astro:content';
import { isoDate } from './dates';
import { nowChanges, nowHeadings } from './now-diff';

type Key = 'log' | 'projects' | 'now' | 'pages';

/** The one draft rule: drafts show in `astro dev` and never in `astro build`. */
export function published<C extends Key>(collection: C): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, (e) => import.meta.env.DEV || !(e.data as { draft: boolean }).draft);
}

/** True when the markdown body has something besides whitespace and HTML comments. */
export const hasBody = (body?: string) => !!body?.replace(/<!--[\s\S]*?-->/g, '').trim();

const byDateDesc = <T>(get: (x: T) => Date) => (a: T, b: T) => get(b).getTime() - get(a).getTime();

/** Astro only logs a warning for a reference to a missing file; make the build fail instead. */
async function checkRefs() {
  const ids = new Set((await getCollection('projects')).map((p) => p.id));
  const refs = [
    ...(await getCollection('log')).map((e) => [`log/${e.id}`, e.data.project?.id] as const),
    ...(await getCollection('projects')).flatMap((p) => (p.data.related ?? []).map((r) => [`projects/${p.id}`, r.id] as const)),
  ];
  for (const [file, id] of refs) {
    if (id && !ids.has(id)) throw new Error(`src/content/${file}.md points to project "${id}", but src/content/projects/${id}.md doesn't exist.`);
  }
}

export async function getProjects() {
  await checkRefs();
  return (await published('projects')).sort(byDateDesc((p) => p.data.updated));
}

const STATUS_ORDER = ['in-progress', 'in-use', 'idea', 'done', 'parked'];
export const byStatusThenUpdated = (a: CollectionEntry<'projects'>, b: CollectionEntry<'projects'>) =>
  STATUS_ORDER.indexOf(a.data.status) - STATUS_ORDER.indexOf(b.data.status) ||
  b.data.updated.getTime() - a.data.updated.getTime();

export type NowVersion = Awaited<ReturnType<typeof getNowVersions>>[number];

/** Now versions, newest first. The first one is the current Now page. */
export async function getNowVersions() {
  const entries = (await published('now')).sort(byDateDesc((n) => n.data.date));
  const snaps = entries.map((e) => ({ ...e.data, ...nowHeadings(e.body) }));
  return entries.map((entry, i) => ({
    entry,
    slug: isoDate(entry.data.date),
    making: snaps[i].making,
    into: snaps[i].into,
    isFirst: i === entries.length - 1,
    changes: nowChanges(snaps[i], snaps[i + 1]),
  }));
}

export interface FeedItem {
  id: string;
  date: Date;
  type: CollectionEntry<'log'>['data']['type'];
  title: string;
  summary: string;
  href?: string;
  link?: string;
  project?: string;
  draft: boolean;
}

/** Log entries merged with one NOW entry per Now version, newest first. */
export async function getFeed(): Promise<FeedItem[]> {
  await checkRefs();
  const projectIds = new Set((await published('projects')).map((p) => p.id));
  const log: FeedItem[] = (await published('log')).map((e) => {
    const project = e.data.project?.id;
    return {
      id: e.id,
      date: e.data.date,
      type: e.data.type,
      title: e.data.title,
      summary: e.data.summary,
      // A draft project has no page in the build, so don't link to it.
      href: hasBody(e.body) ? `/log/${e.id}/`
        : project && projectIds.has(project) ? `/projects/${project}/`
        : e.data.link,
      link: e.data.link,
      project,
      draft: e.data.draft,
    };
  });
  const now: FeedItem[] = (await getNowVersions())
    .filter((v) => v.entry.data.log)
    .map((v) => ({
      id: `now-${v.slug}`,
      date: v.entry.data.date,
      type: 'now',
      title: 'Now page updated',
      summary: v.changes[0] ?? 'New snapshot',
      href: `/now/${v.slug}/`,
      draft: v.entry.data.draft,
    }));
  // Array.sort is stable, so same-date entries keep file order.
  return [...log, ...now].sort(byDateDesc((x) => x.date));
}

export const PAGE_SIZE = 25;
