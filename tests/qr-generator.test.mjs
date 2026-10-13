import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_QR_SETTINGS, parseQrSettings, buildQrGeneratorUrl, QR_LOGOS, QR_STYLES, QR_FONT_SIZES, QR_ALIGNMENTS, QR_SIZES, QR_CAPTIONS } from '../src/lib/qr-generator.ts'

const enabled = () => ({ ...DEFAULT_QR_SETTINGS, enabled: true, generatorUrl: 'https://qr.example.com/generator?source=tiny&icon=old&caption=false#editor' })

test('QR integration is disabled by default, and enabling requires a service URL', () => {
  assert.equal(buildQrGeneratorUrl(DEFAULT_QR_SETTINGS, { fullUrl: 'https://mwit.link/test' }), null)
  assert.throws(() => parseQrSettings({ ...DEFAULT_QR_SETTINGS, enabled: true }))
  assert.deepEqual(parseQrSettings(DEFAULT_QR_SETTINGS), DEFAULT_QR_SETTINGS)
})

test('rejects unsafe service URLs and invalid settings', () => {
  for (const generatorUrl of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'https://user:secret@example.com/', 'https://example.com/\n']) assert.throws(() => parseQrSettings({ ...enabled(), generatorUrl }))
  for (const data of [null, [], {}, { ...enabled(), enabled: 'true' }, { ...enabled(), generatorUrl: 'x'.repeat(2049) }, { ...enabled(), foreground: 'red' }, { ...enabled(), background: 'FFF' }]) assert.throws(() => parseQrSettings(data))
  for (const key of ['logo', 'style', 'fontSize', 'align', 'size', 'caption']) assert.throws(() => parseQrSettings({ ...enabled(), [key]: 'invalid' }))
})

test('maps the exact created link, Thai captions, and every supported parameter', () => {
  const fullUrl = 'https://mwit.link/go/v1r.ab_cd.sig?message=ก+ข&next=https%3A%2F%2Fexample.com%3Fa%3D1#section'
  const settings = { ...enabled(), logo: 'openhouse2026', style: 'classy-rounded', fontSize: 'large', align: 'right', foreground: '#d63850', background: 'ffffff', size: '2048', caption: 'true' }
  const url = new URL(buildQrGeneratorUrl(settings, { fullUrl, title: 'เปิดบ้าน & A + B', description: 'สวัสดี #รายละเอียด' }))
  const expected = { link: fullUrl, title: 'เปิดบ้าน & A + B', description: 'สวัสดี #รายละเอียด', logo: 'openhouse2026', style: 'classy-rounded', fontSize: 'large', align: 'right', foreground: 'D63850', background: 'FFFFFF', size: '2048', caption: 'true', source: 'tiny' }
  assert.deepEqual(Object.fromEntries(url.searchParams), expected)
  assert.equal(url.hash, '#editor')
  assert.equal(url.searchParams.has('icon'), false)
})

test('omits automatic caption mode and clears stale service parameters', () => {
  const url = new URL(buildQrGeneratorUrl(enabled(), { fullUrl: 'https://mwit.link/test' }))
  assert.equal(url.searchParams.has('caption'), false)
  assert.equal(url.searchParams.get('title'), '')
  assert.equal(url.searchParams.get('description'), '')
  assert.equal(url.searchParams.get('logo'), 'alvis')
})

test('caps captions to receiver limits without splitting emoji', () => {
  const url = new URL(buildQrGeneratorUrl(enabled(), { fullUrl: 'https://mwit.link/test', title: 'ก'.repeat(79) + '💙', description: 'ข'.repeat(119) + '💙' }))
  assert.equal(url.searchParams.get('title'), 'ก'.repeat(79))
  assert.equal(url.searchParams.get('description'), 'ข'.repeat(119))
})

test('all documented generator presets round-trip', () => {
  for (const [key, values] of Object.entries({ logo: QR_LOGOS, style: QR_STYLES, fontSize: QR_FONT_SIZES, align: QR_ALIGNMENTS, size: QR_SIZES, caption: QR_CAPTIONS })) {
    for (const value of values) {
      const url = new URL(buildQrGeneratorUrl({ ...enabled(), [key]: value }, { fullUrl: 'https://mwit.link/test' }))
      assert.equal(url.searchParams.get(key), value === 'auto' ? null : value)
    }
  }
})
