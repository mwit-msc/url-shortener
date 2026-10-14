import assert from 'node:assert/strict'
import { deflateRawSync } from 'node:zlib'
import { encodeDirectLink, decodeDirectLink } from '../src/lib/direct-links.ts'
import { directLinkExamples } from '../tests/fixtures/direct-link-examples.mjs'

const secret = 'benchmark-only-key'
let previous = 0, current = 0
const results = directLinkExamples.map(([provider, input]) => {
  const { token, originalUrl } = encodeDirectLink(input, secret)
  assert.equal(decodeDirectLink(token, secret), originalUrl)
  const raw = Buffer.from(originalUrl), compressed = deflateRawSync(raw)
  // v1: "v1r."/"v1d." + base64 payload + "." + 43-character HMAC.
  const oldLength = 48 + (compressed.length < raw.length ? compressed : raw).toString('base64url').length
  previous += oldLength
  current += token.length
  return { provider, destination: originalUrl.length, v1: oldLength, v2: token.length,
    saved: `${Math.round((1 - token.length / oldLength) * 100)}%` }
})
console.table(results)
console.log(`Token characters: ${previous} → ${current} (${Math.round((1 - current / previous) * 100)}% smaller).`)
console.log('Includes signatures; excludes origin and /d/. All 18 synthetic examples round-trip exactly.')
