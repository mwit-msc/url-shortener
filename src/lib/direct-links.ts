import { createHmac, timingSafeEqual } from "node:crypto"
import { deflateRawSync, inflateRawSync } from "node:zlib"

// Self-contained links carry their destination. These limits bound both the
// HTTP request and decompression work; they are independent of the database.
export const MAX_DIRECT_URL_BYTES = 4096
export const MAX_DIRECT_TOKEN_LENGTH = 5600
const SIGNING_CONTEXT = "mwit-tiny/direct-link/v1:"
const COMPACT_SIGNING_CONTEXT = "mwit-tiny/direct-link/v2:"
const COMPACT_TAG_BYTES = 16 // 128-bit truncated HMAC-SHA256, per RFC 2104 §5.
const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

// Immutable v2 wire format: NEVER reorder/edit these patterns or the dictionary.
// A changed pattern/dictionary needs a new version so shared links keep working.
// Only public URL structure belongs here; destinations/individual IDs are not stored.
const URL_PATTERNS: readonly (readonly [string, string])[] = [
  ["https://drive.google.com/drive/folders/", "?usp=sharing"],
  ["https://drive.google.com/file/d/", "/view?usp=sharing"],
  ["https://docs.google.com/spreadsheets/d/", "/edit?usp=drivesdk"],
  ["https://docs.google.com/spreadsheets/d/", "/edit?usp=sharing"],
  ["https://docs.google.com/spreadsheets/d/", "/edit?"],
  ["https://docs.google.com/spreadsheets/d/", "/edit"],
  ["https://docs.google.com/document/d/", "/edit?usp=drivesdk"],
  ["https://docs.google.com/document/d/", "/edit?usp=sharing"],
  ["https://docs.google.com/document/d/", "/edit"],
  ["https://docs.google.com/forms/d/e/", "/viewform?usp=dialog"],
  ["https://docs.google.com/forms/d/e/", "/viewform"],
  ["https://forms.gle/", ""],
  ["https://youtu.be/", ""],
  ["https://canva.link/", ""],
  ["https://script.google.com/a/macros/mwit.ac.th/s/", "/exec"],
  ["https://script.google.com/macros/s/", "/exec"],
  ["https://drive.google.com/drive/folders/", ""],
  ["https://drive.google.com/file/d/", "/view"],
  ["https://www.canva.com/design/", "/view"],
  ["https://openhouse.mwit.ac.th/", ""],
  ["https://docs.google.com/presentation/d/", "/edit?usp=sharing"],
  ["https://docs.google.com/presentation/d/", "/edit"],
  ["https://www.youtube.com/watch?v=", ""],
  ["https://docs.google.com/forms/d/", "/edit"],
]
const URL_DICTIONARY = Buffer.from(URL_PATTERNS.map(([prefix, suffix]) => prefix + suffix).join("\n") +
  "\nhttps://http://www..com.org.net.ac.th/index.html/index.php?utm_content=&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=", "utf8")

export class DirectLinkError extends Error {}

function validateDestination(input: string): string {
  if (!input || Buffer.byteLength(input, "utf8") > MAX_DIRECT_URL_BYTES || /[\u0000-\u001f\u007f]/.test(input)) {
    throw new DirectLinkError("กรอก URL ไม่เกิน 4096 ไบต์ โดยไม่มีอักขระควบคุม")
  }
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    throw new DirectLinkError("กรอก URL แบบเต็มที่ขึ้นต้นด้วย http:// หรือ https://")
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new DirectLinkError("ใช้ URL แบบ http:// หรือ https:// ที่ไม่มีชื่อผู้ใช้หรือรหัสผ่านใน URL")
  }
  // URL normalization can expand Unicode into percent-encoded bytes.
  if (Buffer.byteLength(url.href, "utf8") > MAX_DIRECT_URL_BYTES) {
    throw new DirectLinkError("URL ปลายทางยาวเกินไปสำหรับลิงก์แบบไม่บันทึก")
  }
  return url.href
}

function sign(body: string, secret: string): Buffer {
  if (!secret) throw new Error("Direct link signing is not configured")
  return createHmac("sha256", secret).update(SIGNING_CONTEXT).update(body).digest()
}

function decodeBase64Url(input: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  const bytes = Buffer.from(input, "base64url")
  if (bytes.toString("base64url") !== input) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  return bytes
}

function signCompact(body: Buffer, secret: string): Buffer {
  if (!secret) throw new Error("Direct link signing is not configured")
  return createHmac("sha256", secret).update(COMPACT_SIGNING_CONTEXT).update(body).digest().subarray(0, COMPACT_TAG_BYTES)
}

function packId(id: string, codec: number): Buffer {
  // IDs are opaque six-bit symbols, not base64-encoded bytes: all lengths and
  // final characters must survive, including noncanonical base64 spellings.
  const bytes = Buffer.alloc(1 + Math.ceil(id.length * 6 / 8))
  const padding = (8 - id.length * 6 % 8) % 8
  bytes[0] = codec | ((padding / 2) << 6)
  let accumulator = 0, bits = 0, offset = 1
  for (const character of id) {
    accumulator = (accumulator << 6) | ID_ALPHABET.indexOf(character)
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes[offset++] = (accumulator >>> bits) & 255
      accumulator &= (1 << bits) - 1
    }
  }
  if (bits) bytes[offset] = accumulator << (8 - bits)
  return bytes
}

function unpackId(bytes: Buffer, padding: number): string {
  const symbols = (bytes.length * 8 - padding) / 6
  if (!Number.isInteger(symbols) || symbols < 0 || (padding && (bytes.at(-1)! & ((1 << padding) - 1)))) {
    throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  }
  let accumulator = 0, bits = 0, id = ""
  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte
    bits += 8
    while (bits >= 6 && id.length < symbols) {
      bits -= 6
      id += ID_ALPHABET[(accumulator >>> bits) & 63]
    }
    accumulator &= (1 << bits) - 1
  }
  return id
}

function compactDestination(destination: string): Buffer {
  const raw = Buffer.from(destination, "utf8")
  let smallest: Buffer = Buffer.concat([Buffer.from([0]), raw])
  const consider = (candidate: Buffer) => { if (candidate.length < smallest.length) smallest = candidate }
  const candidate = (codec: number, bytes: Buffer) => consider(Buffer.concat([Buffer.from([codec]), bytes]))
  if (destination.startsWith("https://")) {
    candidate(1, Buffer.from(destination.slice(8), "utf8"))
    if (destination.endsWith("/")) candidate(2, Buffer.from(destination.slice(8, -1), "utf8"))
  }
  URL_PATTERNS.forEach(([prefix, suffix], index) => {
    if (!destination.startsWith(prefix) || !destination.endsWith(suffix) || destination.length < prefix.length + suffix.length) return
    const middle = destination.slice(prefix.length, destination.length - suffix.length)
    candidate(40 + index, Buffer.from(middle, "utf8"))
    if (/^[A-Za-z0-9_-]*$/.test(middle)) consider(packId(middle, 8 + index))
  })
  candidate(3, deflateRawSync(raw, { dictionary: URL_DICTIONARY, level: 9 }))
  candidate(4, deflateRawSync(raw, { level: 9 }))
  return smallest
}

export function encodeDirectLink(input: string, secret: string): { token: string; originalUrl: string } {
  const originalUrl = validateDestination(input)
  const body = compactDestination(originalUrl)
  return { token: `2${Buffer.concat([body, signCompact(body, secret)]).toString("base64url")}`, originalUrl }
}

function decodeLegacy(token: string, secret: string): string {
  const parts = token.split(".")
  if (parts.length !== 3) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  const [version, payload, signature] = parts
  if (version !== "v1r" && version !== "v1d") throw new DirectLinkError("ไม่รองรับรูปแบบของลิงก์นี้")
  const suppliedSignature = decodeBase64Url(signature)
  const expectedSignature = sign(`${version}.${payload}`, secret)
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(suppliedSignature, expectedSignature)) {
    throw new DirectLinkError("ลิงก์ไม่ถูกต้องหรือการตั้งค่าสำหรับยืนยันลิงก์เปลี่ยนไป")
  }
  const bytes = decodeBase64Url(payload)
  try {
    const decoded = version === "v1d" ? inflateRawSync(bytes, { maxOutputLength: MAX_DIRECT_URL_BYTES }) : bytes
    const destination = new TextDecoder("utf-8", { fatal: true }).decode(decoded)
    return validateDestination(destination)
  } catch {
    throw new DirectLinkError("URL ปลายทางในลิงก์นี้ไม่ถูกต้อง")
  }
}

export function decodeDirectLink(token: string, secret: string): string {
  if (token.length > MAX_DIRECT_TOKEN_LENGTH) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  if (!token.startsWith("2")) return decodeLegacy(token, secret)
  const packet = decodeBase64Url(token.slice(1))
  if (packet.length < 1 + COMPACT_TAG_BYTES) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  const body = packet.subarray(0, -COMPACT_TAG_BYTES)
  if (!timingSafeEqual(packet.subarray(-COMPACT_TAG_BYTES), signCompact(body, secret))) {
    throw new DirectLinkError("ลิงก์ไม่ถูกต้องหรือการตั้งค่าสำหรับยืนยันลิงก์เปลี่ยนไป")
  }
  // Authenticate before interpreting headers or inflating attacker-controlled data.
  try {
    const codec = body[0] & 63, padding = (body[0] >>> 6) * 2
    const payload = body.subarray(1)
    const utf8 = (bytes: Buffer) => new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    let destination: string
    if (codec >= 8 && codec < 8 + URL_PATTERNS.length) {
      const [prefix, suffix] = URL_PATTERNS[codec - 8]
      destination = prefix + unpackId(payload, padding) + suffix
    } else {
      if (padding) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
      if (codec >= 40 && codec < 40 + URL_PATTERNS.length) {
        const [prefix, suffix] = URL_PATTERNS[codec - 40]
        destination = prefix + utf8(payload) + suffix
      } else if (codec === 0) destination = utf8(payload)
      else if (codec === 1 || codec === 2) destination = "https://" + utf8(payload) + (codec === 2 ? "/" : "")
      else if (codec === 3 || codec === 4) {
        destination = utf8(inflateRawSync(payload, {
          maxOutputLength: MAX_DIRECT_URL_BYTES,
          ...(codec === 3 ? { dictionary: URL_DICTIONARY } : {}),
        }))
      } else throw new DirectLinkError("ไม่รองรับรูปแบบของลิงก์นี้")
    }
    return validateDestination(destination)
  } catch {
    throw new DirectLinkError("URL ปลายทางในลิงก์นี้ไม่ถูกต้อง")
  }
}

export function getDirectLinkSecret(): string | undefined {
  // A dedicated key lets deployments rotate auth credentials independently.
  // With either choice, the secret stays on the server and is never in a link.
  return process.env.DIRECT_LINK_SECRET || process.env.NEXTAUTH_SECRET
}
