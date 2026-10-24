import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const YAML = require('yaml')
const [,, input, output] = process.argv
const spec = JSON.parse(readFileSync(input, 'utf8'))

spec.info.title = 'Frankfurter API'
spec.info.description = [
  'Frankfurter is an open-source API for current and historical foreign exchange rates published by central banks.',
  'It needs no API key and has no usage quotas.',
  '',
  'This specification is vendored from the official `https://api.frankfurter.dev/v2/openapi.json`',
  '(upstream version 2.1.1, captured 2026-10-24) with operation tags and extra response examples added',
  'for this documentation site. Report upstream API issues at https://github.com/lineofflight/frankfurter/issues.',
].join('\n')
spec.info.contact = { name: 'Frankfurter on GitHub', url: 'https://github.com/lineofflight/frankfurter/issues' }
spec.servers = [{ url: 'https://api.frankfurter.dev/v2', description: 'Public instance' }]

spec.tags = [
  { name: 'Rates', description: 'Latest, historical, and time-series exchange rates blended across providers.' },
  { name: 'Currencies', description: 'Currency codes, names, symbols, and coverage dates.' },
  { name: 'Providers', description: 'The central banks and official sources behind every rate, and provider-specific rates.' },
  { name: 'Coverage', description: 'Find the first and last dates a rate query can answer.' },
]
const tagFor = {
  getRates: 'Rates', getRate: 'Rates',
  getCurrencies: 'Currencies', getCurrency: 'Currencies',
  getProviders: 'Providers', getProvider: 'Providers', getProviderRates: 'Providers', getProviderRate: 'Providers',
  getCoverage: 'Coverage',
}
for (const [path, ops] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(ops)) {
    if (method === 'parameters') continue
    const tag = tagFor[op.operationId]
    if (!tag) throw new Error(`No tag for ${op.operationId}`)
    op.tags = [tag]
  }
}

// Real responses captured with curl on 2026-10-24.
spec.paths['/coverage'].get.responses['200'].content['application/json'].example = {
  base: 'USD', quotes: ['NGN'], providers: null, start_date: '1999-01-04', end_date: '2026-10-25',
}
spec.paths['/providers/{provider}'].get.responses['200'].content['application/json'].example = {
  key: 'CBN', name: 'Central Bank of Nigeria', country_code: 'NG', rate_type: 'official exchange rate',
  pivot_currency: 'NGN', data_url: 'https://www.cbn.gov.ng/rates/exchratebycurrency.asp',
  terms_url: 'https://www.cbn.gov.ng/Legal.html', start_date: '2001-12-11', end_date: '2026-10-23',
  publish_cadence: 'daily', frequency: 'daily', publishes_missed: 0,
  currencies: ['AED', 'CHF', 'CNY', 'DKK', 'EUR', 'GBP', 'JPY', 'NGN', 'SAR', 'USD', 'XDR', 'XOF', 'ZAR'],
  unknown_currencies: [],
}
// Error responses get a concrete example each so readers see the real shape.
const errExample = (status, message) => ({ status, message })
spec.components.responses.UnprocessableEntity.content['application/json'].example = errExample(422, 'invalid currency: ABC')
spec.components.responses.NotFound.content['application/json'].example = errExample(404, 'not found')
spec.components.responses.ServiceUnavailable.content['application/json'].example = errExample(503, 'request deadline exceeded')
for (const r of Object.values(spec.components.responses)) {
  const schema = r.content['application/json'].schema
  schema.properties.status = { type: 'integer', description: 'HTTP status code, repeated in the body.' }
}

const missing = []
for (const [path, ops] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(ops)) {
    if (method === 'parameters') continue
    const ok = Object.entries(op.responses).some(([code, r]) => code.startsWith('2') && r.content && Object.values(r.content).some(mt => 'example' in mt || 'examples' in mt))
    if (!ok) missing.push(`${method.toUpperCase()} ${path}`)
  }
}
if (missing.length) throw new Error('Operations without a 2xx example: ' + missing.join(', '))

writeFileSync(output, YAML.stringify(spec, { lineWidth: 0 }))
console.log('wrote', output, 'operations:', Object.keys(spec.paths).length)
