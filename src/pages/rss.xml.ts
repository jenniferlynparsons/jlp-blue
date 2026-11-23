import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getFeed } from '../lib/queries';

export async function GET(context: APIContext) {
  const items = (await getFeed()).slice(0, 30);
  return rss({
    title: 'jlp.blue',
    description: "Worklog of Jennifer Lyn Parsons: what I'm building, writing, reading, and publishing.",
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<atom:link href="${new URL('rss.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
    items: items.map((i) => ({
      title: i.title,
      description: i.summary,
      pubDate: i.date,
      // Entries with no page of their own link to their row on the log.
      link: i.href ?? `/#${i.id}`,
    })),
  });
}
