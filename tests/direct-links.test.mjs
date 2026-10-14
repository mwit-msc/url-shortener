import { test } from "node:test"
import assert from "node:assert/strict"
import { createHash, createHmac } from "node:crypto"
import { deflateRawSync } from "node:zlib"
import { encodeDirectLink, decodeDirectLink, MAX_DIRECT_TOKEN_LENGTH } from "../src/lib/direct-links.ts"
import { directLinkExamples } from './fixtures/direct-link-examples.mjs'

const secret = "test-only-secret-for-direct-links"
const signPayload = (version, bytes) => {
  const body = `${version}.${bytes.toString('base64url')}`
  const signature = createHmac('sha256', secret).update('mwit-tiny/direct-link/v1:').update(body).digest('base64url')
  return `${body}.${signature}`
}
const signCompact = (body) => '2' + Buffer.concat([body, createHmac('sha256', secret)
  .update('mwit-tiny/direct-link/v2:').update(body).digest().subarray(0, 16)]).toString('base64url')
const codec = (token) => Buffer.from(token.slice(1), 'base64url')[0] & 63

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
  assert.ok([3, 4].includes(codec(token)))
  assert.ok(token.length < original.length)
  assert.equal(decodeDirectLink(token, secret), original)
})

test("avoids compression overhead on short destinations", () => {
  const { token } = encodeDirectLink("https://a.co/", secret)
  assert.equal(codec(token), 2)
  assert.equal(decodeDirectLink(token, secret), "https://a.co/")
})

test("rejects changed payloads, changed signatures, and another secret", () => {
  const { token } = encodeDirectLink("https://mwit.ac.th/", secret)
  const packet = Buffer.from(token.slice(1), 'base64url')
  for (let offset = 0; offset < packet.length; offset++) {
    const modified = Buffer.from(packet)
    modified[offset] ^= 1
    assert.throws(() => decodeDirectLink('2' + modified.toString('base64url'), secret))
  }
  assert.throws(() => decodeDirectLink(token, "another-secret"))
})

test("rejects malformed, noncanonical, and unsupported tokens", () => {
  const { token } = encodeDirectLink("https://mwit.ac.th/", secret)
  for (const input of ['', 'bad', token + '.extra', '3' + token.slice(1), token + '=', '2AA', 'a'.repeat(MAX_DIRECT_TOKEN_LENGTH + 1)]) {
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

test("existing raw and compressed v1 links retain their destinations and signatures", () => {
  const original = 'https://example.com/old-link?repeat=' + 'saved,'.repeat(20) + '#keep'
  for (const [version, payload] of [['v1r', Buffer.from(original)], ['v1d', deflateRawSync(original)]]) {
    const token = signPayload(version, payload)
    assert.equal(decodeDirectLink(token, secret), original)
    assert.throws(() => decodeDirectLink(token, 'different-key'))
    assert.throws(() => decodeDirectLink(token.replace('v1', 'v0'), secret))
  }
})

test("packs opaque IDs losslessly across all lengths and final six-bit symbols", () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  for (let length = 4; length <= 80; length++) {
    for (const final of alphabet) {
      const id = createHash('sha512').update(`synthetic-${length}`).digest('base64url').slice(0, length - 1) + final
      const original = `https://docs.google.com/spreadsheets/d/${id}/edit?usp=drivesdk`
      const { token } = encodeDirectLink(original, secret)
      assert.equal(decodeDirectLink(token, secret), original)
      assert.ok(token.length < original.length)
    }
  }
})

test("preserves pattern variants, query order, fragments, empty queries and extra path segments", () => {
  for (const original of [
    'https://drive.google.com/drive/folders/A_B-cD9?usp=sharing',
    'https://drive.google.com/file/d/A_B-cD9/view?usp=sharing',
    'https://docs.google.com/spreadsheets/d/A_B-cD9/edit?',
    'https://docs.google.com/document/d/A_B-cD9/edit?usp=drivesdk',
    'https://docs.google.com/forms/d/e/A_B-cD9/viewform?usp=dialog',
    'https://forms.gle/A_B-cD9',
    'https://youtu.be/dQw4w9WgXcQ?t=12&list=Ab%2Fc#watch',
    'https://canva.link/A_B-cD9',
    'https://script.google.com/a/macros/mwit.ac.th/s/A_B-cD9/exec',
    'https://script.google.com/macros/s/A_B-cD9/exec',
    'https://www.canva.com/design/ABC/a_b-c/view?utm_campaign=designshare&utm_source=uniquelinks',
    'https://openhouse.mwit.ac.th/register/walk-in',
    'https://docs.google.com/presentation/d/A_B-cD9/edit?usp=sharing',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://docs.google.com/forms/d/A_B-cD9/edit',
    'https://drive.google.com/drive/folders/A_B-cD9?usp=sharing&usp=other#fragment',
    'https://drive.google.com/drive/folders/A_B-cD9?z=1&a=2&z=3',
    'https://drive.google.com/file/d/A_B-cD9/another/path/view?usp=sharing',
    'https://docs.google.com.evil.example/spreadsheets/d/ABC/edit?usp=drivesdk',
    'http://example.com/path?x=%2F#tail/',
    'https://example.com/path?x=%2F#tail/',
    'https://example.com/path/', 'https://example.com/path',
  ]) {
    assert.equal(decodeDirectLink(encodeDirectLink(original, secret).token, secret), original)
  }
})

test("uses the smallest packet and reduces the signed Roblox example from 74 to 37 characters", () => {
  const original = 'https://roblox.com/'
  const { token } = encodeDirectLink(original, secret)
  assert.equal(codec(token), 2)
  assert.equal(token.length, 37)
  assert.equal(signPayload('v1r', Buffer.from(original)).length, 74)
  assert.equal(decodeDirectLink(token, secret), original)
})

test("compact decoder rejects authentic unknown codecs, invalid padding and invalid UTF-8", () => {
  for (const body of [
    Buffer.from([5]), Buffer.from([32]), Buffer.from([39]),
    Buffer.from([64, ...Buffer.from('https://example.com/')]),
    Buffer.from([8, 0]), // Eight bits cannot hold a whole number of six-bit symbols.
    Buffer.from([8 | 64, 1]), // Nonzero two-bit padding.
    Buffer.from([8 | 128]), // Padding without any ID bytes.
    Buffer.from([0, 0xff, 0xfe]), Buffer.from([40, 0xff, 0xfe]),
    Buffer.from([0, ...Buffer.from('javascript:alert(1)')]),
    Buffer.from([1, ...Buffer.from('user:pass@example.com/')]),
  ]) assert.throws(() => decodeDirectLink(signCompact(body), secret))
})

test("compact inflation and reconstructed patterns enforce the destination byte limit", () => {
  const bomb = deflateRawSync('https://example.com/' + 'x'.repeat(100_000))
  for (const mode of [3, 4]) {
    assert.throws(() => decodeDirectLink(signCompact(Buffer.concat([Buffer.from([mode]), bomb])), secret))
    assert.throws(() => decodeDirectLink(signCompact(Buffer.from([mode, 0xff, 0xff, 0xff])), secret))
  }
  assert.throws(() => decodeDirectLink(signCompact(Buffer.from([40, ...Buffer.from('x'.repeat(4090))])), secret))
})

test("compact generic and pattern packets reject noncanonical base64 spellings", () => {
  const token = signCompact(Buffer.from([2, ...Buffer.from('a.co')]))
  // Last base64 character has four padding bits; changing them must not be ignored.
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  const last = alphabet.indexOf(token.at(-1))
  const changed = token.slice(0, -1) + alphabet[last + 1]
  assert.throws(() => decodeDirectLink(changed, secret))
})

test("the representative school URL corpus round-trips and beats v1 for every link", () => {
  for (const [provider, original] of directLinkExamples) {
    const { token } = encodeDirectLink(original, secret)
    assert.equal(decodeDirectLink(token, secret), original, provider)
    const raw = Buffer.from(original), compressed = deflateRawSync(raw)
    const legacy = signPayload(compressed.length < raw.length ? 'v1d' : 'v1r', compressed.length < raw.length ? compressed : raw)
    assert.ok(token.length < legacy.length, provider)
  }
})

test("published v2 pattern and dictionary packets remain decodable", () => {
  // Fixed wire fixtures protect shared links from pattern/dictionary edits.
  assert.equal(decodeDirectLink('2yAPwfnA_QCUih7B5Z0ezCXB0-6LPWaQ', secret),
    'https://drive.google.com/drive/folders/A_B-cD9?usp=sharing')
  assert.equal(decodeDirectLink('2A8Mb-I5OzvqJ8Um6ydDyBZ-VmDYAALzi-jqxJeDOxfm2v4x6sr0', secret),
    'https://www.canva.com/design/ABC/a_b-c/view?utm_campaign=designshare&utm_source=uniquelinks')
})
