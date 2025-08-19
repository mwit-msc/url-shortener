import { prisma } from "./prisma"

// Generate a random shortcode
export function generateShortCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if a shortcode is available for a specific domain
export async function isShortCodeAvailable(shortCode: string, domainId: string): Promise<boolean> {
  const existing = await prisma.link.findUnique({
    where: {
      shortCode_domainId: {
        shortCode,
        domainId,
      },
    },
  })
  return !existing
}

// Generate a unique shortcode for a domain
export async function generateUniqueShortCode(domainId: string, length = 6): Promise<string> {
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode(length)
    const isAvailable = await isShortCodeAvailable(shortCode, domainId)

    if (isAvailable) {
      return shortCode
    }

    attempts++
  }

  // If we can't generate a unique code with the current length, try with a longer one
  return generateUniqueShortCode(domainId, length + 1)
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

// Validate custom shortcode format
export function isValidShortCode(shortCode: string): boolean {
  // Allow alphanumeric characters, hyphens, and underscores
  // Length between 3 and 20 characters
  const regex = /^[a-zA-Z0-9_-]{3,20}$/
  return regex.test(shortCode)
}
