---
title: "Build and publish API docs on Thally"
subtitle: "Set up a Thally Cloud site, generate an API reference from an OpenAPI file, and publish through a pull request. Worked example: the Frankfurter exchange-rate API."
slug: build-and-publish-api-docs-on-thally
cover: images/cover.png
tags: documentation, developer-experience, api, openapi
---

By the end of this guide you will have a published documentation site for an HTTP API with:

- an introduction, a quickstart, and one guide with troubleshooting;
- an API reference generated from your OpenAPI file, with a console that sends real requests;
- Markdown mirrors, `llms.txt`, and an MCP server produced from the same source;
- a pull-request workflow where every change is checked before it goes live.

The worked example is [Frankfurter](https://frankfurter.dev), a free exchange-rate API with no
API key. Finished site: https://frankfurter-docs.thally.app. Source:
https://github.com/harystyleseze/frankfurter-docs. Where a value is specific to this example, the
placeholder you should use is shown first.

[Thally](https://thally.io) publishes a Git repository of MDX pages plus one `docs.json` file as a
Next.js site. You can self-host the runtime or connect the repository to Thally Cloud, which
builds, previews, and publishes it. This guide uses Cloud. Links go to
[Thally's documentation](https://docs.thally.io) where a topic has more depth.

## Prerequisites

- A GitHub account. Thally creates the docs repository through a GitHub App.
- Node.js 20.19+, 22.14+, or 24 for local preview. Check with `node --version`. Publishing does
  not need Node.
- An API whose first request succeeds without sign-up or approval.
- About two hours.

## Step 1: Verify the API's first request

Run the first command your quickstart will show. If it does not succeed as written, change the
example before writing anything else.

```bash
curl https://api.frankfurter.dev/v2/rate/USD/NGN
```

Expected output (the date and rate will be current when you run it):

```json
{"date":"2026-10-24","base":"USD","quote":"NGN","rate":1340.09}
```

Frankfurter publishes its OpenAPI spec at `https://api.frankfurter.dev/v2/openapi.json`. You
need your API's spec in Step 4.

## Step 2: Create the site in Thally Cloud

Sign in at `app.thally.io` and select **Create a site**. The wizard has five steps.

1. **Site details.** Enter the site name, a one-line summary, and the address
   `<your-site>.thally.app` (example: `frankfurter-docs.thally.app`). On Cloud, the name and
   summary set the header text, page titles, and the `llms.txt` heading, so write them as readers
   should see them. Both can be changed later in **Site settings**.

2. **Docs source.** The repository that becomes your site. Select **Create a new docs
   repository** (1), choose the GitHub account and a repository name (2), and leave
   **Private repository** on or off as you prefer (3). The other two options import a public
   docs site by URL or connect a Thally repository you already have.

   ![Docs source step: (1) Create a new docs repository, (2) account and repository name, (3) the private toggle](images/02-docs-source.png)

   GitHub then asks you to install the Thally Labs app. The wizard expects **All repositories**
   (1) with the listed permissions (2). If your organisation allows selected-repository installs
   only, create a compatible repository first and use **Use an existing repository**.

   ![GitHub App install screen: (1) All repositories, (2) the requested permissions](images/03-github-app-permissions.png)

3. **Product sources.** Other repositories, such as your API's code, that Thally Track watches
   to propose documentation updates. Select **I'll do this later**. See
   [Thally Track](https://docs.thally.io/guides/thally-track).

4. **Knowledge surfaces.** Repositories Track can write to but Thally does not build. Skip for a
   first site.

5. **Review and publish.** Select **Publish site**.

Home shows **Waiting to publish** (1) while the first deployment runs. The Site at a glance
panel reads **Repository: Not connected** (2) until it finishes. Wait one to two minutes.

![Home page during the first publish: (1) Waiting to publish, (2) Repository: Not connected](images/05-home-publishing.png)

When the status is **Live** (1), the first agent-readiness report shows 89 out of 100, grade B,
for the ten starter pages (2). **View live site** (3) opens the template content.

![Home page after publishing: (1) Live, (2) agent readiness 89 out of 100, (3) View live site](images/06-home-live-readiness.png)

## Step 3: Clone the repository

```bash
git clone https://github.com/<your-account>/<your-docs-repo>
cd <your-docs-repo>
npm ci
npm run dev
```

Example: `git clone https://github.com/harystyleseze/frankfurter-docs`. The site runs at
`http://localhost:3040`.

The repository is a copy of Thally's starter. These paths are yours to edit:

| Path | What it is |
|---|---|
| `src/content/**.mdx` | Pages. The file path is the URL: `guides/historical-rates.mdx` is `/guides/historical-rates`. |
| `docs.json` | Tabs, sidebar groups, page order, redirects, footer, feature flags. [Reference](https://docs.thally.io/guides/docs-json-reference). |
| `openapi.yaml` | Your API spec. The API reference is generated from it. |
| `src/data/site.ts` | Site name, description, links, and brand palette for self-hosted builds. |
| `AGENTS.md` | Writing rules for people and coding agents who edit the docs. |

Everything else is the runtime, pinned by `starter-release.json` and refreshed by a weekly
"Update Thally framework" pull request. Do not edit it.

## Step 4: Add your OpenAPI spec

Save your spec as `openapi.yaml` at the repository root, then check three things:

- **`servers`** lists the base URL the console should call. The **Try it** panel relays requests
  through the docs server, so the API does not need CORS, but the URL must match a `servers`
  entry.
- **`tags`** on every operation. The sidebar groups operations by their first tag; untagged
  operations land in one flat group.
- **A 2xx response `example`** on every operation. Thally's readiness check `openapi_examples`
  fails any operation without one.

For Frankfurter, `scripts/vendor-openapi.mjs` in the example repository downloads the upstream
spec and applies the last two changes, so the file can be regenerated instead of hand-edited.

Point a tab at the spec in `docs.json`:

```json
{
  "tab": "API reference",
  "groups": [{ "group": "Overview", "pages": ["api/introduction"] }],
  "api": { "source": "openapi.yaml", "tagsOrder": ["Rates", "Currencies", "Providers", "Coverage"] }
}
```

Each operation becomes a page with parameters, examples, and the **Try it** panel. See
[API reference setup](https://docs.thally.io/guides/api-reference-setup).

## Step 5: Write the pages

Delete the starter pages under `src/content/` and write your own. Every page starts with
frontmatter:

```yaml
---
title: Quickstart
description: Fetch the latest US dollar to Nigerian naira rate and convert an amount in JavaScript or Python, with no API key.
lastVerified: 2026-10-24
verifiedVersion: "2.1.1"
---
```

- `title` and `description` are required. The description is the search snippet and the summary
  AI tools read.
- `lastVerified` is the date a person ran the page's examples. The readiness report rewards it,
  and `thally check --drift` can flag pages whose sources changed since.
- Use `navTitle` for a shorter sidebar label. Full list:
  [frontmatter reference](https://docs.thally.io/guides/frontmatter-reference).

Register every page in `docs.json`. Unregistered pages are reported as orphans by `thally check`
and do not count in the readiness discovery check. Add `redirects` in `docs.json` for the
starter pages you deleted.

Components used on the example site: `<Steps>`, `<Tabs>` for JavaScript and Python samples, one
`<Accordion>` per troubleshooting case, and `<Note>`, `<Tip>`, `<Warning>`.

Run every example and paste the real output. On the example site this caught one failure: the
Python sample using `urllib` returned `403 Forbidden` with body `error code: 1010`, while `curl`,
Node's `fetch`, and `requests` succeeded. Frankfurter's CDN blocks Python's default User-Agent.
The fix, a `User-Agent` header, is in the quickstart, the guide's troubleshooting section, and
the API overview's error table.

## Step 6: Validate locally

```bash
npm run check
npm run typecheck
npm run build
```

- `npm run check` reports missing frontmatter, orphan pages, broken links and anchors, and
  OpenAPI structure. Expected output: `No issues found.`
- `npm run build` compiles every MDX page. The same step runs on `postinstall`, so a page with
  an unclosed tag fails `npm ci` as well as the build. The error names the file and line.

To see the readiness score on the production build:

```bash
npm start
curl -s localhost:3040/api/agent-readiness | jq '.score, .grade'
```

On the example site the score went from 89 (B) to 100 (A) after three changes: a 2xx example on
every operation, `lastVerified` on every page, and a `readiness.goldenQuestions` list in
`docs.json` with eight reader questions and the page that should answer each. That check runs
the questions against the site's own search index.

## Step 7: Publish through a pull request

```bash
git checkout -b <branch-name>
git add -A
git commit -m "<message>"
git push -u origin <branch-name>
```

Example: branch `docs/frankfurter-v2-launch`, message `docs: document the Frankfurter v2 API`.

Open the pull request on GitHub. The repository's CI workflow reads the changed paths: a diff
limited to `src/content/`, `public/`, `docs.json`, `openapi.yaml`, or the README runs
`thally check --ci` only; any other change runs the full typecheck and production build. Thally
Cloud builds a preview for each docs pull request, listed on the **Deployments** page. Merge to
`main` to publish. Rollback is on the same page. See
[Thally Cloud](https://docs.thally.io/guides/thally-cloud).

After the merge, confirm the published outputs:

```bash
curl -s https://<your-site>.thally.app/api/agent-readiness | jq '.score, .grade'
curl -s https://<your-site>.thally.app/llms.txt
curl -s https://<your-site>.thally.app/quickstart.md | head
npx @modelcontextprotocol/inspector --cli https://<your-site>.thally.app/api/mcp --transport http --method tools/list
```

Results for the example site, 2026-10-24, about five minutes after the merge: readiness
`100` / `"A"` across five pages; `llms.txt` lists Introduction, Quickstart, Historical rates,
Overview, and Changelog; the MCP server exposes eight tools (`list_pages`, `read_page`,
`search_docs`, `search_sections`, `list_api_operations`, `get_api_operation`, `list_changes`,
`agent_readiness`).

## Findings for the Thally team

Each item was hit while building this site, is not covered in Thally's documentation, and can be
repeated with the steps given.

### 1. A page that cannot compile reaches a green pull request

**Steps.** Create `src/content/_broken.mdx` with valid frontmatter and an unclosed `<Note>`.
Run `npm run check`, then `npm run runtime-sources:build`.
**Observed.** `check` reports two warnings (orphan, short body) and exits cleanly. The build
fails: `Failed to compile runtime MDX src/content/_broken.mdx: Expected a closing tag for <Note>
(2:1-2:7)`. CI runs only `thally check --ci` for diffs under `src/content/`, so the pull request
is green and the build fails later. `check` already parses MDX for pages containing `<Step` but
discards the parse error.
**Resolution.** Report MDX parse errors from `check`, or add `npm run runtime-sources:build` to
the content-only CI path.

### 2. Local and CI checks run different CLI versions

**Steps.** Read the `check` script in `package.json` and the version in
`.github/thally-tooling/package.json`; run `npm view @thallylabs/cli version`.
**Observed.** Local runs `@thallylabs/cli@latest` (0.8.124 on 2026-10-24); CI runs the pinned
0.8.120. The two can disagree.
**Resolution.** Point the local script at the pinned tooling:
`"check": "npm ci --ignore-scripts --prefix .github/thally-tooling && .github/thally-tooling/node_modules/.bin/thally check"`,
so the weekly framework update bumps one version for both.

### 3. Unknown frontmatter keys pass silently

**Steps.** Add `sidebarTitle: Wrong label` to any page. Run `npm run check`.
**Observed.** `No issues found.` The sidebar label does not change. The documented field is
`navTitle`; `sidebarTitle` is the name another docs tool uses, and the migration package already
maps it. `check` has no key list.
**Resolution.** Warn in `check` on keys outside the documented list, reusing the migration
package's mapping.

### 4. The readiness score's heaviest check is undocumented, and the starter fails one out of the box

**Steps.** Create a site from the starter and open the readiness report. Search the
`docs.json` reference for `readiness`. Add `readiness.goldenQuestions` and rerun.
**Observed.** 89/B with `openapi_examples` failing on the starter spec. The reference has no
`readiness` key, although the starter's `docs.json` ships one and `retrieval_eval` carries the
largest weight. One golden question on this site missed until reworded: generated `/rates`
operation pages outranked the authored page for any question containing "rate".
**Resolution.** Ship the starter spec with examples; document `readiness.topK` and
`readiness.goldenQuestions`; weight authored pages above operation pages in search.

## Next steps

- Thally documentation: https://docs.thally.io
- Example repository, including the spec script and the pages: https://github.com/harystyleseze/frankfurter-docs
- Frankfurter API: https://frankfurter.dev
