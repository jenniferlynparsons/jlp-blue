import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const draft = z.boolean().default(false);
// Empty template fields (e.g. `link:`) parse as null; treat them as unset.
const opt = <T extends z.ZodType>(schema: T) => schema.nullish().transform((v) => v ?? undefined);

const log = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(['built', 'made', 'wrote', 'note', 'now']),
    project: opt(reference('projects')),
    link: opt(z.url()),
    summary: z.string(),
    draft,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    kind: z.enum(['code', 'making', 'archiving', 'writing']),
    status: z.enum(['idea', 'in-progress', 'in-use', 'done', 'parked']),
    started: opt(z.string().regex(/^\d{4}-\d{2}$/, 'started must look like YYYY-MM')),
    updated: z.coerce.date(),
    problem: opt(z.string()),
    stack: opt(z.array(z.string())),
    platform: opt(z.string()),
    materials: opt(z.array(z.string())),
    tools: opt(z.array(z.string())),
    repo: opt(z.url()),
    live: opt(z.url()),
    related: opt(z.array(reference('projects'))),
    roadmap: opt(z.array(z.object({ item: z.string(), done: z.boolean().default(false) }))),
    draft,
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/now' }),
  schema: z.object({
    date: z.coerce.date(),
    quote: opt(z.object({ text: z.string(), author: opt(z.string()), source: opt(z.string()) })),
    reading: z.array(z.object({
      title: z.string(), author: opt(z.string()), digging: z.boolean().default(false), note: opt(z.string()),
    })).default([]),
    watching: z.array(z.object({
      title: z.string(), kind: z.enum(['film', 'tv']), digging: z.boolean().default(false), note: opt(z.string()),
    })).default([]),
    links: z.array(z.object({
      title: z.string(), url: z.url(), site: opt(z.string()), note: opt(z.string()),
    })).default([]),
    changes: opt(z.array(z.string())),
    log: z.boolean().default(true),
    draft,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), intro: z.string(), draft }),
});

export const collections = { log, projects, now, pages };
