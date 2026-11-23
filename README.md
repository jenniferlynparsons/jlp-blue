# jlp.blue

My worklog. Astro, plain markdown, hosted on Netlify.

## 1. Run it locally

1. `npm install` (first time only)
2. `npm run dev`, then open http://localhost:4321

Drafts show up here with a DRAFT stamp. They never show on the live site.

## 2. Add a log entry

1. Copy `templates/log.md` into `src/content/log/`.
2. Rename it `YYYY-MM-DD-short-name.md`.
3. Fill in the fields. Anything you write below the `---` gets its own page.

## 3. Update the Now page

1. Copy the newest file in `src/content/now/`.
2. Rename it to today's date: `YYYY-MM-DD.md`.
3. Edit it.

The archive and the "what changed" lines happen on their own. To write the change lines yourself, add `changes:` with a list of lines like `+ reading Piranesi`. To skip the log entry for an update, add `log: false`.

## 4. Add or update a project

1. Copy the matching template into `src/content/projects/`: `project-code.md`, `project-making.md`, or `project-other.md` (archiving, writing).
2. Name it `short-name.md`. That name is what `project:` and `related:` point to.
3. As things move, change `status` and `updated`.
4. Check off roadmap items with `done: true`.

## 5. Hide something

Set `draft: true`.

## 6. "Digging it"

Set `digging: true` on any reading or watching item on the Now page.

## 7. Publish

Commit and push. Netlify rebuilds in about a minute.

## 8. If the build fails

It's almost always a frontmatter typo. Run `npm run build` locally. The error names the file and the field.

Other checks: `npx astro check` (types) and `npm test` (the Now "what changed" logic).

## 9. The `jlp-worklog-entry` skill

It writes log entries and code project pages from your Claude sessions into `src/content/log/` and `src/content/projects/`. They come in with `draft: true`. Read them, then flip them to `false`.

## Settings worth knowing

- **Site URL:** `SITE` at the top of `astro.config.mjs`. Set it to the `*.netlify.app` URL while you test, then back to `https://jlp.blue`.
- **Social links on About:** the `social` list in `src/pages/about.astro`.
