import { test } from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { deflateRawSync } from "node:zlib"
import { encodeDirectLink, decodeDirectLink, MAX_DIRECT_TOKEN_LENGTH } from "../src/lib/direct-links.ts"

const secret = "test-only-secret-for-direct-links"
const signPayload = (version, bytes) => {
  const body = `${version}.${bytes.toString('base64url')}`
  const signature = createHmac('sha256', secret).update('mwit-tiny/direct-link/v1:').update(body).digest('base64url')
  return `${body}.${signature}`
}

test("round-trips a destination including query strings and fragment", () => {
  const original = "https://mwit.ac.th/admissions?year=2026&tag=a%2Fb&tag=c#apply"
  const { token, originalUrl } = encodeDirectLink(original, secret)
  assert.equal(originalUrl, original)
  assert.equal(decodeDirectLink(token, secret), original)
  assert.ok(!token.includes(secret))
})

test("Unicode and encoded query values survive URL normalization", () => {
  const original = "https://example.com/สมัคร?name=นักเรียน&next=%2Fnews#ข้อมูล"
  const { token } = encodeDirectLink(original, secret)
  assert.equal(decodeDirectLink(token, secret), new URL(original).href)
})

test("uses compression when it reduces payload size", () => {
  const original = `https://example.com/?items=${"school-open-house,".repeat(120)}`
  const { token } = encodeDirectLink(original, secret)
  assert.ok(token.startsWith('v1d.'))
  assert.ok(token.length < original.length)
  assert.equal(decodeDirectLink(token, secret), original)
})

test("avoids compression overhead on short destinations", () => {
  const { token } = encodeDirectLink("https://a.co/", secret)
  assert.ok(token.startsWith('v1r.'))
  assert.equal(decodeDirectLink(token, secret), "https://a.co/")
})

test("rejects changed payloads, changed signatures, and another secret", () => {
  const { token } = encodeDirectLink("https://mwit.ac.th/", secret)
  const parts = token.split('.')
  parts[1] = `${parts[1][0] === 'A' ? 'B' : 'A'}${parts[1].slice(1)}`
  assert.throws(() => decodeDirectLink(parts.join('.'), secret))
  const signature = token.split('.')
  signature[2] = `${signature[2][0] === 'A' ? 'B' : 'A'}${signature[2].slice(1)}`
  assert.throws(() => decodeDirectLink(signature.join('.'), secret))
  assert.throws(() => decodeDirectLink(token, "another-secret"))
})

test("rejects malformed, noncanonical, and unsupported tokens", () => {
  const { token } = encodeDirectLink("https://mwit.ac.th/", secret)
  for (const input of ['', 'bad', token + '.extra', token.replace('v1', 'v2'), token + '=', 'a'.repeat(MAX_DIRECT_TOKEN_LENGTH + 1)]) {
    assert.throws(() => decodeDirectLink(input, secret))
  }
})

test("limits expansion even for an authentic compressed payload", () => {
  const oversized = Buffer.from('https://example.com/' + 'x'.repeat(100_000))
  assert.throws(() => decodeDirectLink(signPayload('v1d', deflateRawSync(oversized)), secret))
})

test("rejects corrupt compressed data even with a valid signature", () => {
  assert.throws(() => decodeDirectLink(signPayload('v1d', Buffer.from('not compressed data')), secret))
})

test("rejects dangerous protocols, credentials, controls, and relative URLs", () => {
  for (const input of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/file', '//example.com', '/relative', 'https://user:password@example.com/', 'https://example.com/\r\nLocation:bad', 'not-a-url']) {
    assert.throws(() => encodeDirectLink(input, secret))
  }
})

test("decoder revalidates authentic destinations and UTF-8", () => {
  assert.throws(() => decodeDirectLink(signPayload('v1r', Buffer.from('javascript:alert(1)')), secret))
  assert.throws(() => decodeDirectLink(signPayload('v1r', Buffer.from([0xff, 0xfe])), secret))
})

test("limits both input bytes and normalized Unicode expansion", () => {
  assert.throws(() => encodeDirectLink('https://example.com/' + 'x'.repeat(4096), secret))
  assert.throws(() => encodeDirectLink('https://example.com/' + 'ก'.repeat(500), secret))
})

test("signing requires a server secret", () => {
  assert.throws(() => encodeDirectLink('https://example.com/', ''))
})
