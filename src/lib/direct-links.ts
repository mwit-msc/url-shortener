import { createHmac, timingSafeEqual } from "node:crypto"
import { deflateRawSync, inflateRawSync } from "node:zlib"

// Self-contained links carry their destination. These limits bound both the
// HTTP request and decompression work; they are independent of the database.
export const MAX_DIRECT_URL_BYTES = 4096
export const MAX_DIRECT_TOKEN_LENGTH = 5600
const SIGNING_CONTEXT = "mwit-tiny/direct-link/v1:"

export class DirectLinkError extends Error {}

function validateDestination(input: string): string {
  if (!input || Buffer.byteLength(input, "utf8") > MAX_DIRECT_URL_BYTES || /[\u0000-\u001f\u007f]/.test(input)) {
    throw new DirectLinkError("Enter a URL of up to 4096 bytes without control characters.")
  }
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    throw new DirectLinkError("Enter a complete http:// or https:// URL.")
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new DirectLinkError("Use an http:// or https:// URL without embedded login credentials.")
  }
  // URL normalization can expand Unicode into percent-encoded bytes.
  if (Buffer.byteLength(url.href, "utf8") > MAX_DIRECT_URL_BYTES) {
    throw new DirectLinkError("The destination URL is too long for a direct link.")
  }
  return url.href
}

function sign(body: string, secret: string): Buffer {
  if (!secret) throw new Error("Direct link signing is not configured")
  return createHmac("sha256", secret).update(SIGNING_CONTEXT).update(body).digest()
}

function decodeBase64Url(input: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) throw new DirectLinkError("Invalid direct link.")
  const bytes = Buffer.from(input, "base64url")
  if (bytes.toString("base64url") !== input) throw new DirectLinkError("Invalid direct link.")
  return bytes
}

export function encodeDirectLink(input: string, secret: string): { token: string; originalUrl: string } {
  const originalUrl = validateDestination(input)
  const raw = Buffer.from(originalUrl, "utf8")
  const compressed = deflateRawSync(raw)
  const useCompression = compressed.length < raw.length
  const payload = (useCompression ? compressed : raw).toString("base64url")
  const body = `${useCompression ? "v1d" : "v1r"}.${payload}`
  return { token: `${body}.${sign(body, secret).toString("base64url")}`, originalUrl }
}

export function decodeDirectLink(token: string, secret: string): string {
  if (token.length > MAX_DIRECT_TOKEN_LENGTH) throw new DirectLinkError("Invalid direct link.")
  const parts = token.split(".")
  if (parts.length !== 3) throw new DirectLinkError("Invalid direct link.")
  const [version, payload, signature] = parts
  if (version !== "v1r" && version !== "v1d") throw new DirectLinkError("Unsupported direct link version.")
  const suppliedSignature = decodeBase64Url(signature)
  const expectedSignature = sign(`${version}.${payload}`, secret)
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(suppliedSignature, expectedSignature)) {
    throw new DirectLinkError("This direct link is invalid or its signing key has changed.")
  }
  const bytes = decodeBase64Url(payload)
  try {
    const decoded = version === "v1d" ? inflateRawSync(bytes, { maxOutputLength: MAX_DIRECT_URL_BYTES }) : bytes
    const destination = new TextDecoder("utf-8", { fatal: true }).decode(decoded)
    return validateDestination(destination)
  } catch {
    throw new DirectLinkError("The destination in this direct link is invalid.")
  }
}

export function getDirectLinkSecret(): string | undefined {
  // A dedicated key lets deployments rotate auth credentials independently.
  // With either choice, the secret stays on the server and is never in a link.
  return process.env.DIRECT_LINK_SECRET || process.env.NEXTAUTH_SECRET
}
