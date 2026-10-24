# Frankfurter API documentation

Community documentation for [Frankfurter](https://frankfurter.dev), the free, open-source
exchange-rate API, built and published with [Thally](https://thally.io).

- **Live site:** https://frankfurter-docs.thally.app
- **Article (how this site was built):** see `article/` in this repository
- **Upstream API project:** https://github.com/lineofflight/frankfurter

## What is in here

| Path | Purpose |
|---|---|
| `src/content/*.mdx` | Pages: introduction, quickstart, historical-rates guide, API overview, changelog |
| `docs.json` | Navigation, redirects, footer, and `readiness.goldenQuestions` |
| `openapi.yaml` | Vendored Frankfurter v2 spec with tags and examples; drives the API reference and Try it console |
| `src/data/site.ts` | Site name, description, links |
| `AGENTS.md` | Writing rules and product context for people and coding agents |
| `scripts/vendor-openapi.mjs` | Regenerates `openapi.yaml` from the official spec |

Everything else is the Thally runtime, pinned in `starter-release.json` and updated by the
**Update Thally framework** workflow. Do not edit those files by hand.

## Run locally

Node.js 20.19+, 22.14+, or 24+.

```bash
npm ci
npm run dev
```

Open http://localhost:3040.

## Validate before you push

```bash
npm run check        # content, navigation, links, OpenAPI
npm run typecheck
npm run build
```

## Refresh the OpenAPI spec

```bash
curl -sS https://api.frankfurter.dev/v2/openapi.json -o /tmp/frankfurter-openapi.json
node scripts/vendor-openapi.mjs /tmp/frankfurter-openapi.json openapi.yaml
npm run check
```

Then re-run the examples on each page and update `lastVerified`.

## How publishing works

Thally Cloud is connected to this repository through the Thally GitHub App.

- A pull request gets an isolated preview deployment and runs `thally check --ci`.
- Merging to `main` publishes to https://frankfurter-docs.thally.app after Thally validates the build.
- The same source also serves `/llms.txt`, `/openapi.yaml`, per-page Markdown (`/quickstart.md`),
  JSON (`?format=json`), and a read-only MCP server at `/api/mcp`.

## License

MIT for this repository. Frankfurter is MIT-licensed by its own authors; rates remain subject to
each provider's terms.
