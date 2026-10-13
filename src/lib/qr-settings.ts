import { prisma } from "@/lib/prisma"
import { DEFAULT_QR_SETTINGS, parseQrSettings } from "@/lib/qr-generator"

export async function getQrSettings() {
  const row = await prisma.qrGeneratorConfig.findUnique({ where: { id: "default" } })
  if (!row) return { ...DEFAULT_QR_SETTINGS }
  const options = row.options && typeof row.options === "object" && !Array.isArray(row.options) ? row.options : {}
  return parseQrSettings({ ...options, enabled: row.enabled, generatorUrl: row.generatorUrl })
}
