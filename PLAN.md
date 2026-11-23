# jlp.blue v1: build plan for Claude Code

**Owner:** JP (Jennifer Lyn Parsons), GitHub `jenniferlynparsons`
**Written:** 2026-11-23
**Goal:** Build JP's new worklog site in Astro, ready to deploy on Netlify, with content that JP writes as plain markdown files.

---

## 0. Read this first (instructions for Claude Code)

1. Read this whole plan before you write code. Then make a short task list from section 11 (Milestones) and work through it in order.
2. **The visual spec is in `design-reference/`.** Open each HTML file in a browser. These are static exports of the approved designs. Match them closely: colors, type, spacing, stamps, cards, layout. Text in `[brackets]` is placeholder copy.
3. **Use the current stable Astro release** and its current docs: content collections with the Content Layer API (`glob()` loader) and Zod schemas. Don't use a UI framework (no React, Vue, or Svelte). Use plain `.astro` components and plain CSS.
4. **Keep dependencies minimal.** Expected: `astro`, `@astrojs/rss`, `@astrojs/sitemap`, `@fontsource/ibm-plex-mono`, `@fontsource/newsreader`. Ask JP before you add anything else.
5. **Git:** JP usually runs git herself. Before your first commit, ask whether she wants you to commit. If not, suggest commit messages at the end of each milestone.
6. **Don't build anything in section 2 (Out of scope),** even if it looks easy.
7. When you finish a milestone, run `npm run build` and `npx astro check`. Fix every error before you continue.
8. If something in this plan conflicts with the design reference, the plan wins. Tell JP about the conflict.

---

## 1. What the site is

jlp.blue is JP's public worklog: a lab book of what she builds, makes, writes, reads, and watches. It has a reverse-chronological log, a Now page with an archive of past versions, and a directory of her projects. The projects directory is also her personal dashboard.

JP updates the site by editing markdown files in MarkEdit or VS Code, then pushing to GitHub. Netlify builds the site from the repo. There is no CMS and no automation in v1.

**Audience:** JP herself (looking back), and people who follow her work. She may share the Now page on social media.

**Tone of all UI copy:** plain, direct, warm. No marketing language.

---

## 2. Out of scope for v1

Don't build these. They're planned for v2.

- Reading and Watching pages (designs are in `design-reference/` for later; don't link them in the nav)
- Any import from Obsidian vaults, RSS feeds from JP's other sites, or other automation
- Images of any kind, including photos, screenshots, cover art, and generated social share images
- Comments, analytics, newsletter, search
- Anything about Luna Station Quarterly (LSQ). It is deliberately kept off this site.
- Migrating content from the old WordPress site

---

## 3. Tech stack and setup

| Item | Choice |
|---|---|
| Framework | Astro (current stable), static output |
| Language | TypeScript (strict) for config, schemas, and utilities |
| Styling | Plain CSS: one global stylesheet with custom properties, plus scoped `<style>` in components |
| Fonts | Self-hosted with Fontsource: IBM Plex Mono (400, 500, 600) and Newsreader (400, 500, 600, plus 400 italic) |
| Feeds | `@astrojs/rss` for `/rss.xml` (log entries) |
| Sitemap | `@astrojs/sitemap` |
| Hosting | Netlify (static). `netlify.toml` with `command = "npm run build"`, `publish = "dist"` |
| Node | Current LTS. Add `.nvmrc`. |
| Site URL | Set `site` in `astro.config.mjs` to `https://jlp.blue`. JP builds on a `*.netlify.app` subdomain first, so put the URL in one constant that's easy to change. |

**Repository visibility:** draft files (`draft: true`) are hidden from the built site, but they are visible in the source. **Recommend a private GitHub repo to JP.** Netlify works with private repos.

---

## 4. Repository structure

```
jlp-blue/
├── README.md                 ← JP's how-to-update guide (see section 10)
├── PLAN.md                   ← this file
├── design-reference/         ← static design exports (reference only, not built)
├── templates/                ← copy-and-fill templates (not built)
│   ├── log.md
│   ├── now.md
│   ├── project-code.md
│   ├── project-making.md
│   └── project-other.md
├── netlify.toml
├── .nvmrc
├── astro.config.mjs
├── src/
│   ├── content.config.ts     ← collection schemas
│   ├── content/
│   │   ├── log/              ← YYYY-MM-DD-slug.md
│   │   ├── projects/         ← slug.md
│   │   ├── now/              ← YYYY-MM-DD.md
│   │   └── pages/
│   │       └── about.md
│   ├── components/
│   ├── layouts/
│   │   └── Base.astro
│   ├── lib/                  ← dates, labels, now-diff, queries
│   ├── pages/
│   └── styles/
│       └── global.css
└── public/
    └── favicon.svg           ← a simple ink-blue "jlp" mark in IBM Plex Mono style
```

The folder names `src/content/log/`, `src/content/projects/`, and `templates/project-code.md` must stay exactly as shown. JP's Claude skill `jlp-worklog-entry` writes into them.

---

## 5. Design system

The look is called **Lab notebook**: graph paper, ink blue, mono labels, and rubber-stamp tags. See `design-reference/home.html`.

### 5.1 Tokens (put these in `global.css` as custom properties)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#1B3A8C` | links, borders, stamps, rules, filled buttons |
| `--ink-dark` | `#0F2260` | link hover |
| `--text` | `#14275E` | body text |
| `--muted` | `#3B4C7A` | labels, dates, secondary text |
| `--paper` | `#F6F8FC` | page background |
| `--grid` | `#DCE4F1` | graph-paper lines |
| `--rule` | `#9FB0D3` | section label underline |
| `--rule-light` | `#C5D1E8` | dividers between entries, card shadow |
| `--tint` | `#E6EDF8` | tinted tiles |
| `--card` | `#FFFFFF` | card background |

Every text/background pair above meets WCAG AA. Don't add new colors without checking contrast.

**Graph-paper background** (on `body`):
```css
background-color: var(--paper);
background-image:
  linear-gradient(var(--grid) 1px, transparent 1px),
  linear-gradient(90deg, var(--grid) 1px, transparent 1px);
background-size: 24px 24px;
```

### 5.2 Type

- **Body and headings:** Newsreader. Body 18–21px, line-height 1.5–1.65. Page `h1` 56px, weight 500, line-height 1. Entry titles 22–26px, weight 600.
- **Labels, dates, nav, metadata:** IBM Plex Mono. 11–15px. Section labels are uppercase, letter-spacing 0.1–0.12em, color `--muted`.
- **Wordmark:** "jlp.blue" in IBM Plex Mono, 30px, weight 600, letter-spacing -0.02em. Under it: "worklog of Jennifer Lyn Parsons" in mono 13px, `--muted`.
- **Dates** display as `2026·11·23` (middle dots), in mono.

### 5.3 Layout

- Content container: `max-width: 1120px`, centered, padding `48px 40px 80px`. On narrow screens, padding `24px 20px 56px`.
- Two-column pages (Home, Now, project pages, About): a flex row with wrap and a 56px gap. Main column `flex: 999 1 560px`, sidebar `flex: 1 1 300px`. The sidebar drops below the main column on narrow screens. No media queries are needed for this.
- Vertical rhythm between major blocks: 32–40px.
- Must work at 375px, 768px, and 1280px wide.

### 5.4 Components

Build these as `.astro` components. The names are suggestions.

| Component | Description |
|---|---|
| `SiteHeader` | Wordmark on the left, nav on the right, 2px `--ink` rule below. Nav: **Log, Now, Projects, About**. The current page gets `aria-current="page"`, weight 600, and a 2px underline. |
| `SiteFooter` | 2px `--ink` rule above. Left: "Built with love in New Jersey." Right: "how this log works" (links to `/about/#how`) and "paladin.space →" (links to `https://paladin.space`). Mono 13px. |
| `Stamp` | Inline label: mono 11–12px, weight 600, uppercase, letter-spacing 0.08em, 1.5px border, padding 3px 8px, slight rotation (between -3deg and 2deg). Variants: `outline` (white fill), `filled` (ink fill, white text), `dashed`. The rotation is decorative; the text must stay readable. |
| `SectionLabel` | Mono uppercase label with a 1px `--rule` underline and an optional right-aligned note. |
| `Card` | White, 1.5px `--ink` border, `box-shadow: 6px 6px 0 var(--rule-light)`, padding 24–32px. |
| `LogEntry` | Date column (96px, mono) + type stamp + title (links to the project or external link) + one-line summary + optional "→ site" label for external links. Divider below. |
| `NowCard` | The compact Now summary for the home sidebar (see 7.1). |
| `SideList` | Sidebar card with a label, a list of items (title, subtitle, optional DIGGING IT stamp, optional italic note), and an optional "more" link. |
| `ProjectCard` | Kind label, status stamp, title, one-line summary, mono meta line. Status `idea` gets a dashed card border. |
| `FilterBar` | Two rows of toggle buttons (kind, status). See 7.3. |
| `ChangeLines` | The "+ / − / ✓" lines for a Now version (see 7.4). |

**Stamp mapping**

| Value | Label | Variant |
|---|---|---|
| log type `built` | BUILT | outline |
| log type `made` | MADE | filled |
| log type `wrote` | WROTE | outline, fully rounded |
| log type `note` | NOTE | outline |
| log type `now` | NOW | dashed |
| status `idea` | IDEA | dashed |
| status `in-progress` | IN PROGRESS | filled |
| status `in-use` | IN USE | outline |
| status `done` | DONE | outline |
| status `parked` | PARKED | dashed, `--muted` color |
| kind `code` / `making` / `archiving` / `writing` | CODE / MAKING / ARCHIVING / WRITING | outline |
| Now item `digging: true` | DIGGING IT | outline, 10px, rotated -3deg |
| `draft: true` (dev only) | DRAFT | dashed |

### 5.5 Accessibility

- A skip link to `#main` as the first focusable element.
- A visible focus style on all links and buttons: `outline: 2px solid var(--ink); outline-offset: 2px`.
- Use real `<button>` elements with `aria-pressed` for filters. Tap targets of at least 44px.
- Use `<time datetime="YYYY-MM-DD">` for every date.
- One `h1` per page. Keep heading levels in order.
- `lang="en"` on `<html>`.

---

## 6. Content model

Define every collection in `src/content.config.ts` with the `glob()` loader and a Zod schema. Builds must **fail loudly** on invalid frontmatter.

**Dates:** YAML parses `2026-11-23` as UTC midnight. Always format dates with UTC methods (or `timeZone: 'UTC'`) so they don't shift back a day in US time zones. Write a single `formatDate()` helper in `src/lib/dates.ts` and use it everywhere.

**Drafts:** every collection has `draft: boolean` (default `false`). Drafts are excluded from `astro build`. In `astro dev`, show them with a DRAFT stamp so JP can preview them. Put this rule in one query helper in `src/lib/`.

### 6.1 `log` — `src/content/log/YYYY-MM-DD-slug.md`

```ts
{
  title: string,
  date: date,
  type: 'built' | 'made' | 'wrote' | 'note' | 'now',
  project?: reference('projects'),  // slug of a project
  link?: url,                        // external link (a blog post, a guide)
  summary: string,                   // one line
  draft: boolean = false,
}
```
The body is optional. If there is a body, the entry gets its own page at `/log/[slug]/`, and the title links there. If there's no body, the title links to the project page, or to `link`, or to nothing.

### 6.2 `projects` — `src/content/projects/slug.md`

```ts
{
  title: string,
  summary: string,               // one line, shown on cards
  kind: 'code' | 'making' | 'archiving' | 'writing',
  status: 'idea' | 'in-progress' | 'in-use' | 'done' | 'parked',
  started?: string,              // 'YYYY-MM'
  updated: date,
  problem?: string,              // "why it exists", shown near the top of the project page
  stack?: string[],              // code
  platform?: string,             // code, e.g. 'macOS desktop', 'web', 'Obsidian plugin'
  materials?: string[],          // making
  tools?: string[],              // making
  repo?: url,
  live?: url,
  related?: reference('projects')[],
  roadmap?: { item: string, done: boolean = false }[],
  draft: boolean = false,
}
```
The body is the story section. JP writes her own heading in the body: `## Building it with Claude` (code), `## How I made it` (making), or `## How it's going` (archiving, writing).

### 6.3 `now` — `src/content/now/YYYY-MM-DD.md`

```ts
{
  date: date,
  quote?: { text: string, author?: string, source?: string },
  reading: { title: string, author?: string, digging: boolean = false, note?: string }[] = [],
  watching: { title: string, kind: 'film' | 'tv', digging: boolean = false, note?: string }[] = [],
  links: { title: string, url: url, site?: string, note?: string }[] = [],
  changes?: string[],     // optional manual "what changed" lines; replaces the auto-diff (see 7.4)
  log: boolean = true,    // when true, this version adds a NOW entry to the log
  draft: boolean = false,
}
```
The body has two sections: `## Making` and `## Into lately`. Each item under them is a `### Heading` followed by a short paragraph. The newest non-draft file is the current Now page; all older ones form the archive.

### 6.4 `pages` — `src/content/pages/about.md`

Frontmatter: `title`, `intro`. The body is the bio. The "How this log works" section is a component on the About page (see 7.5), so it stays consistent.

---

## 7. Pages and behavior

### 7.1 Home — `/` (log)

Reference: `design-reference/home.html`

- Intro line under the header: "A running record of what I'm building, writing, reading, and publishing." (Newsreader, 32px)
- **Main column:** the "LOG" section label, then log entries, newest first. **Merge two sources:** (a) the `log` collection and (b) one generated NOW entry for each Now version where `log` is true. The NOW entry's title is "Now page updated", its summary is the first change line or "New snapshot", and it links to `/now/YYYY-MM-DD/`. Sort by date descending. If two entries share a date, keep file order stable.
- **Pagination:** 25 entries per page. `/` is page 1, then `/log/2/`, `/log/3/`, and so on. At the bottom: "older entries ↓" and "newer entries ↑" links.
- **Sidebar:**
  1. `NowCard`: header "Now" + "updated 2026·11·23", the quote (italic, with a 2px left rule, plus a mono attribution line "— Author · from my commonplace book"), READING (up to 3, with DIGGING IT stamps), WATCHING (up to 2), MAKING (the `###` headings under `## Making`), INTO LATELY (the `###` headings under `## Into lately`), and a link "full Now page · past versions →". Hide any section that's empty.
  2. PROJECTS: the 5 most recently `updated` non-draft projects, each with its status stamp, then "all projects →".

### 7.2 Log entry page — `/log/[slug]/`

Only for entries that have a body. Uses the same header and footer. Shows the date, type stamp, title, and summary, then the body, then a link back to the log and to the project, if there is one.

### 7.3 Projects — `/projects/`

Reference: `design-reference/projects.html`

- Title "Projects". Intro: "Things I'm making: software tools, physical things, and long-haul organizing projects. Each one says why it exists, where it stands, and what's next."
- **Filter bar:** row 1 is kind (All kinds, Code, Making, Archiving, Writing). Row 2 is status (Any status, In progress, In use, Done, Idea, Parked).
  - Each card has `data-kind` and `data-status` attributes.
  - A small inline script toggles visibility. Buttons use `aria-pressed`, one active per row, and the rows combine with AND.
  - The filter bar renders with the `hidden` attribute; the script removes it. **Without JavaScript, every card shows and no filter bar appears.**
  - When no cards match, show the line "Nothing here yet."
- **Latest card:** the most recently `updated` project, shown big (reference: the large card at the top). It has a "LATEST · TOUCHED <date>" label, title, status and kind stamps, `problem`, the first unfinished roadmap item as "NEXT UP", "read the whole story →", and a meta list.
- **Grid** of `ProjectCard`s for every other project: `repeat(auto-fill, minmax(320px, 1fr))`. Sort order: in-progress, in-use, idea, done, parked; within each group, by `updated` descending.
- Meta line by kind: code shows `platform` (+ "open it →" if `live`). Making shows the materials joined with commas. Archiving and writing show related project names, e.g. "tooling: The Stacks".

### 7.4 Project page — `/projects/[slug]/`

References: `design-reference/project-code.html` and `design-reference/project-making.html`

- "← all projects", then the title (h1), status stamp, kind stamp, and summary.
- **Main column:**
  1. THE PROBLEM (label "WHY I MADE THEM" for kind `making`): the `problem` text at 21px.
  2. The body, rendered as markdown. Style `##` headings as the mono section labels. Blockquotes get a 3px left rule and 24px italic text.
  3. IN THE LOG: every log entry whose `project` is this slug, newest first, as compact rows.
- **Sidebar:**
  1. Meta card: a definition list. Code shows kind, status, stack (joined with ·), runs on, started, touched. Making shows kind, status, made, materials, tools. If `repo` is set, add a filled button "source on GitHub"; if `live` is set, add "open it →".
  2. ROADMAP card: `[x]` for done items (struck through), `[ ]` for the rest. Hide it if there's no roadmap.
  3. RELATED card, if `related` is set.

### 7.5 Now — `/now/`, `/now/YYYY-MM-DD/`, `/now/archive/`

Reference: `design-reference/now.html` and `design-reference/now-archive.html`

**`/now/`** (the current version):
- Title "Now". Intro: "What I'm reading, watching, making, and into right now." then a line break, then "A snapshot of where I am now." A stamp at the right: "UPDATED 2026·11·23".
- **Main column:**
  1. The quote, with a small right-aligned label "from my commonplace book" above it (no section heading), a 3px left rule, 30px italic text, and a mono caption "— Author, *Source*".
  2. MAKING: each `###` item is a small blog-style post (26px title, 19px paragraph, divider below).
  3. INTO LATELY: same style.
- **Sidebar** (three `SideList` cards): READING ("this year in reading →" is a v2 link, so leave it out for now), RECENTLY WATCHED (subtitle "film" or "tv"), ARTICLES & LINKS (titles link to the URL; subtitle is `site`; no italics on titles). Items with `digging: true` get the DIGGING IT stamp, and a `note` shows as an italic line below the item. Hide any card that has no items.
- Below both columns: PREVIOUS VERSION, showing **only the one previous version** (its date, change lines, and "read that version →"), then "all past versions →" linking to `/now/archive/`.

**`/now/YYYY-MM-DD/`:** the same layout for an older version, with a notice at the top: "This is an older Now page from 2026·10·30. See what I'm up to now →". Leave out the PREVIOUS VERSION block.

**`/now/archive/`** (not in the nav): title "Now archive". Intro: "Every version of my Now page, newest first, with what changed each time." Group versions by year (section label "2026"). Each row shows the date, the change lines, and "read this version →". The current version says "Current version."

**Change lines** (`src/lib/now-diff.ts`): compare each version with the one before it.
- For `reading`, `watching`, and `links`: a title in the new version only → `+ reading <title>` / `+ watched <title>` / `+ link <title>`. A title in the old version only → `− reading <title>` / `− watched <title>` / `− link <title>`. Compare titles case-insensitively, after trimming.
- For `###` headings under `## Making` and `## Into lately`: `+ making: <heading>` / `− making: <heading>`, and `+ into: <heading>` / `− into: <heading>`.
- A new quote → `~ new quote`.
- If `changes` is set in frontmatter, use those lines instead.
- The oldest version gets "First version."
- Show the symbols with `aria-label`s ("added", "removed", "changed").
- Write unit-testable pure functions. Add a tiny test with `node:test` or Vitest (ask JP before adding Vitest).

### 7.6 About — `/about/`

Reference: `design-reference/about.html`

- Title "About". The intro comes from frontmatter.
- **Main column:** the bio from `about.md` at 21px. Then the `HowThisLogWorks` component with `id="how"`.
  - Intro: "Most of what I make lives somewhere else. This log collects it in one place, newest first. When something new shows up in one of these places, it gets an entry here:"
  - Rows (title / description / link):
    - **Projects** / things I make: tools, crafts, collections / Projects (`/projects/`)
    - **Blog posts** / essays and notes / pixelpaperyarn.rocks (`https://pixelpaperyarn.rocks`)
    - **Guides** / reference material I share / woolgathering.xyz (`https://www.woolgathering.xyz`)
    - **Author news** / books, stories, events / jenniferlynparsons.com (`https://jenniferlynparsons.com`)
    - **Now updates** / written here / Now (`/now/`)
  - Closing line: "The site is built with Astro and hosted on Netlify. I built it with Claude, the same way I build the software tools on the Projects page."
  - (The Reading and Watching rows come back in v2.)
- **Sidebar:** a SAY HELLO card with links to Bluesky, Mastodon, Tumblr, and Instagram. **JP must supply these URLs.** Leave `#` placeholders with a `TODO` comment and list them in your final report. End the card with "everything else: paladin.space →".

### 7.7 Other routes

- `/rss.xml`: the 30 latest log entries, including generated NOW entries. Item title = entry title, description = summary, link = the entry's link target on jlp.blue (or the external link). Add `<link rel="alternate" type="application/rss+xml">` in `<head>`.
- `/404`: "That page isn't here." plus links to Log and Projects, in the same layout.
- `sitemap-index.xml` from `@astrojs/sitemap`.

### 7.8 Head and meta

- Title pattern: `Page — jlp.blue`. The home page title is `jlp.blue — worklog of Jennifer Lyn Parsons`.
- A meta description on every page: summaries on project and log pages, the intro elsewhere.
- Open Graph and Twitter text tags (title, description, url, type). **No `og:image` in v1.**
- A canonical URL built from `site`.

---

## 8. Templates (`templates/`)

Create these files exactly. Comments explain each field to JP. The templates are plain copies, so they aren't loaded by Astro.

**`templates/log.md`**
```markdown
---
# Save as src/content/log/YYYY-MM-DD-short-name.md
title: 
date: YYYY-MM-DD
type: built        # built | made | wrote | note
project:           # optional: a project file name without .md, e.g. routines
link:              # optional: an outside URL, e.g. a blog post
summary: 
draft: false
---

<!-- Optional. Anything written here gets its own page. Delete this comment if you leave it empty. -->
```

**`templates/now.md`**
```markdown
---
# Copy the LATEST file in src/content/now/, rename it to today's date, then edit.
# (Use this template only if you're starting fresh.)
date: YYYY-MM-DD
quote:
  text: ""
  author: ""
  source: ""
reading:
  - title: ""
    author: ""
    digging: false
    note: ""
watching:
  - title: ""
    kind: film       # film | tv
    digging: false
    note: ""
links:
  - title: ""
    url: ""
    site: ""
    note: ""
draft: false
---

## Making

### Thing I'm making
A few sentences of context.

## Into lately

### Thing I'm into
A few sentences of context.
```

**`templates/project-code.md`**
```markdown
---
# Save as src/content/projects/short-name.md
title: 
summary:           # one line
kind: code
status: in-progress   # idea | in-progress | in-use | done | parked
started: YYYY-MM
updated: YYYY-MM-DD
problem: 
stack: []
platform:          # web | macOS desktop | iOS | Obsidian plugin | ...
repo:              # public URL, or leave empty
live:              # public URL, or leave empty
related: []
roadmap:
  - item: 
    done: false
draft: true
---

## Building it with Claude

```

**`templates/project-making.md`**: the same, with `kind: making`, no `stack`, `platform`, or `repo`, plus `materials: []` and `tools: []`. Body heading: `## How I made it`.

**`templates/project-other.md`**: for `archiving` or `writing`. No `stack`, `platform`, `materials`, or `tools`. Body heading: `## How it's going`.

---

## 9. Seed content

Seed the site so every page has something to show. **Every seeded project gets `draft: true`.** JP will check each one and flip it to `false`. The facts below come from JP; the one-line summaries are drafts.

### 9.1 Projects

| slug | title | kind | status | summary | notes |
|---|---|---|---|---|---|
| `jlp-blue` | jlp.blue | code | in-progress | This site: a public worklog, rebuilt in Astro. | platform: web. stack: [Astro]. Use the real start date. |
| `routines` | Routines | code | in-progress | A small desktop checklist for work routines that change by weekday. | stack: [Swift, SwiftUI]. platform: macOS desktop. started: 2026-11 |
| `pomozine` | pomozine | code | in-use | A zine-styled pomodoro timer with synthesized sounds. | stack: [HTML, CSS, JavaScript]. platform: web. repo: https://github.com/jenniferlynparsons/pomozine. live: https://jenniferlynparsons.github.io/pomozine |
| `pto-bridge-planner` | PTO Bridge Planner | code | in-use | Spreads time off around holidays and blackout dates. | platform: web. Repo `pto-calculator`; ask JP if it's public. |
| `the-stacks` | The Stacks | code | in-progress | The Obsidian plugin behind the home library catalog. | platform: Obsidian plugin. related: [cataloging-the-library] |
| `cataloging-the-library` | Cataloging the home library | archiving | in-progress | Getting all ~5,000 books into one catalog, shelf by shelf. | related: [the-stacks] |
| `in-the-margins` | In the Margins | code | in-progress | Keeps 20–30 nonfiction books in motion and flags the ones going stale. | platform: Obsidian vault |
| `brainrot` | Brainrot | code | in-progress | Tracks fanfic reading across AO3, Calibre, and podfics. | platform: Obsidian plugin |
| `misprint` | Misprint | code | in-progress | A drawing-and-guessing game for team fun time. | platform: web |
| `workout-player` | Workout Player | code | in-use | Plays workouts I've written up as JSON, step by step. | platform: phone app. No repo or live link. |
| `year-in-reading` | Year in Reading | code | in-progress | A year-end report across my reading vaults. | platform: web |
| `calibre-sheet-sync` | Calibre sheet sync | code | in-use | Syncs my Calibre fanfic library to a Google Sheet. | |
| `rinkside` | Rinkside | code | idea | Following women's college and pro hockey in one place. | platform: iOS + web |
| `bookmarks` | Bookmarks | making | done | Physical bookmarks I made. | materials and tools: ask JP |

For `updated`, use the day you create the file. JP will correct the dates.
For `problem` and the body heading, use the matching template, with `<!-- DRAFT: rewrite in your own words -->` where JP's writing goes. Don't invent stories.

### 9.2 Log

One entry, not a draft: `YYYY-MM-DD-jlp-blue.md` (today's date), type `built`, project `jlp-blue`, summary "Started rebuilding jlp.blue as a worklog in Astro."

### 9.3 Now

One file for today's date with `draft: true`. Fill it with the template's empty structure, plus these from JP:
- Making: `### Rebuilding this site`, `### Routines`, `### Cataloging the home library`
- Into lately: `### Learning hockey`, `### Taking care of my succulents`
- Paragraphs: `<!-- DRAFT -->`
- Leave reading, watching, links, and quote empty for JP.

### 9.4 About (`src/content/pages/about.md`, `draft: false`)

```markdown
---
title: About
intro: "Hi. This is my worklog: a running record of what I'm building, writing, reading, and publishing."
---

I'm Jennifer Lyn Parsons, and most people call me JP. I've worked in software for more than seventeen years, and these days I lead engineering teams.

I'm also a writer, maker, and designer. I make zines, design for print, and keep a home library of around five thousand books, which I'm finally cataloging.

<!-- DRAFT: a paragraph on what you care about: craft, building useful things, bringing people along. -->

<!-- DRAFT: a paragraph on the fun stuff: comics, baseball, hockey, music, tea, succulents. -->
```

---

## 10. README.md (JP's how-to-update guide)

Write it for JP, who knows web development but wants a quick, low-friction checklist. Plain language, short sections, numbered steps.

1. **Run it locally:** `npm install`, then `npm run dev` (drafts show up here).
2. **Add a log entry:** copy `templates/log.md` into `src/content/log/`, rename it, fill it in.
3. **Update the Now page:** copy the newest file in `src/content/now/`, rename it to today's date, edit it. The archive and "what changed" lines happen automatically.
4. **Add or update a project:** copy the matching `templates/project-*.md`. Change `status` and `updated` as things move. Check off roadmap items with `done: true`.
5. **Hide something:** `draft: true`.
6. **"Digging it":** set `digging: true` on any reading or watching item.
7. **Publish:** commit and push. Netlify rebuilds in about a minute.
8. **If the build fails:** it's almost always a frontmatter typo. Run `npm run build` locally; the error names the file and the field.
9. **The `jlp-worklog-entry` skill** writes log entries and code project pages from your Claude sessions. Drafts come in with `draft: true`.

---

## 11. Milestones

Work in this order. Each milestone ends with `npm run build` + `npx astro check` passing.

| # | Milestone | Done when |
|---|---|---|
| M1 | **Scaffold:** Astro project, TypeScript strict, fonts, `global.css` tokens, `Base` layout, `SiteHeader`, `SiteFooter`, skip link, favicon, `netlify.toml`, `.nvmrc` | An empty page shows the header, footer, and graph paper, and matches `design-reference/home.html` |
| M2 | **Content:** `content.config.ts` with all four collections, the draft helper, the date helper, the templates, the seed content | A bad frontmatter value makes the build fail with a clear error; drafts are hidden in `build` and visible in `dev` |
| M3 | **Home and log:** `LogEntry`, merged NOW entries, pagination, `/log/[slug]/`, `NowCard`, the projects sidebar, RSS | Home matches the reference; RSS validates |
| M4 | **Projects:** index, Latest card, filters (with and without JS), project pages for both code and making | Both project page references match; filters work and fail safely |
| M5 | **Now:** `/now/`, version pages, archive, `now-diff` with tests | With 3 test versions (make temporary fixtures, then delete them), the change lines are correct |
| M6 | **About, 404, meta, sitemap** | Every page has a title, description, canonical, and OG tags |
| M7 | **QA:** check at 375, 768, and 1280px; keyboard-only pass; contrast spot check; no console errors; README | JP can follow the README on her own |

**Final report to JP:** what was built, what's still TODO (social URLs, project facts to confirm, drafts to rewrite), how to run it, and the Netlify setup steps:
1. Push to a GitHub repo (private recommended).
2. In Netlify: Add new site → Import from Git → pick the repo. The build settings come from `netlify.toml`.
3. The site goes live on a `*.netlify.app` URL. Pointing the jlp.blue domain at it comes later, after JP backs up the WordPress site.

---

## 12. v2 (later, for context only; don't build)

- An Obsidian "Worklog" vault as the source, with a publish script that copies only public notes into the repo.
- RSS imports from pixelpaperyarn.rocks, woolgathering.xyz, and jenniferlynparsons.com (each needs `@astrojs/rss` first) as automatic log entries.
- Reading and Watching pages fed by vault exports (designs in `design-reference/reading.html` and `watching.html`).
- A generated social share image for the Now page (`design-reference/now-share-card.html`).
- Images on project pages.
