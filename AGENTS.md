# Documentation project instructions

## Repository role

Thally has three distinct repositories. `thallylabs/thally` is the only
authored source for the open-source runtime and toolchain,
`thallylabs/starter` is this complete customer-ready template, and
`thallylabs/thally-cloud` is the private control plane.

The sole production architecture authority is
[`thally-cloud/ARCHITECTURE.md`](https://github.com/thallylabs/thally-cloud/blob/main/ARCHITECTURE.md).
That repository is private; this file defines only starter-local ownership and
workflow rules. Do not create another architecture document here.

Runtime-owned files are a generated snapshot, not a second implementation.
Never hand-apply a runtime fix here. In `thallylabs/starter`, run the **Sync
Thally runtime** workflow, review its generated pull request, and let CI prove
that the snapshot matches the exact runtime commit in `starter-release.json`.
That generator is restricted to the canonical template repository. Customer
repositories use **Update Thally framework** to open a reviewed update pull
request from a published scaffold release. It checks weekly on Tuesday at
03:43 UTC and also supports manual dispatch. An existing matching update PR
is retained; customer PRs are never merged automatically. The workflow requires a published
CLI with `--require-complete` support and stops before changes when that
capability is unavailable. For local updates, use the ownership-aware
`npm run starter:update` command, reviewing its dry-run plan
and resolving framework or package conflicts before applying. Never run the
snapshot generator against a customer tree or replace only its manifest.

Before placing a feature, trace the actual creation or request path in code and
identify the deployed artifact. Do not infer ownership from repository names
or an outdated planning document.

Package versions, scaffold releases, managed site releases, and Cloud platform
releases are separate identities. A starter synchronization does not itself
upgrade an existing site or move a production release pointer.

## Project boundaries

- Pages are MDX files in `src/content/`.
- Navigation and portable product features are configured in `docs.json`.
- Site identity and versioned brand defaults live in `src/data/site.ts`.
- `starter-release.json` and runtime-owned paths listed in it are
  machine-managed; do not hand-edit them.
- Runtime changes belong in `thallylabs/thally` and arrive here only through
  the generated synchronization pull request.
- Starter-owned seed content and portable defaults are authored here. Paid
  service internals remain in `thallylabs/thally-cloud`.
- Never place credentials in source files. Use `.env.local` locally and secret
  storage in the deployment platform.

## Writing standards

- Address the reader as “you” and use active voice.
- Lead with the outcome, then state prerequisites and the shortest working path.
- Use sentence-case headings and concise paragraphs.
- Format commands, files, configuration keys, and code with backticks.
- Tell readers what success looks like and link the next useful task.
- Keep advanced or optional paths outside the primary workflow.

## Content model

- Every page needs `title` and `description` frontmatter.
- Keep page slugs stable once published.
- Add pages to `docs.json`; do not leave useful pages orphaned.
- Update `openapi.yaml` when API behavior changes.
- Run `npm run check -- --ci`, or install the pinned CI tooling with
  `npm ci --ignore-scripts --prefix .github/thally-tooling` and run
  `.github/thally-tooling/node_modules/.bin/thally check --ci .`, `npm run typecheck`,
  and `npm run build` before publishing.

## Product context

This site documents **Frankfurter**, an open-source, keyless exchange-rate API
(`https://api.frankfurter.dev/v2`, upstream repo `lineofflight/frankfurter`).
It is an independent community site, not an official Frankfurter publication.

- **Audience:** developers integrating exchange rates (fintech, remittance,
  analytics), with a West African reader in mind. Prefer `USD`/`NGN` examples
  and mention `GHS`, `KES`, `ZAR` where a second currency helps.
- **Terminology:** `base` is the currency you have, `quote` the currency you
  want, `rate` is units of quote per one base. A *blended rate* is Frankfurter's
  outlier-filtered combination of every provider's observation. A *provider* is
  a central bank or official source identified by a key such as `ECB` or `CBN`.
- **Scope:** document API v2 only. Mention v1 solely as deprecated. Do not
  document self-hosting beyond linking to `https://frankfurter.dev/deploy/`.
- **Accuracy rules:** every request and response in a page must have been run
  against the live API; keep the real values and set `lastVerified` to the run
  date. Never invent rates, dates, provider keys, or error messages. When API
  behavior is uncertain, say so rather than guessing.
- **Source of truth for endpoints:** `openapi.yaml`, vendored from the official
  `https://api.frankfurter.dev/v2/openapi.json`. Re-vendor with the script in
  `scripts/vendor-openapi.mjs` rather than hand-editing operations; only tags
  and added examples are local changes.
