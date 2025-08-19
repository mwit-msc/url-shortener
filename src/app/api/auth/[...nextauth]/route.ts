import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"
import { validateHost, createHostValidationResponse } from "@/lib/host-validation"

const handler = NextAuth(authOptions)

export async function GET(request: NextRequest, { params }: { params: { nextauth: string[] } }) {
  if (!validateHost(request)) {
    return createHostValidationResponse()
  }
  return handler(request, { params })
}

export async function POST(request: NextRequest, { params }: { params: { nextauth: string[] } }) {
  if (!validateHost(request)) {
    return createHostValidationResponse()
  }
  return handler(request, { params })
}
