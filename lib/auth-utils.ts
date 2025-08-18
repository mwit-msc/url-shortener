import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export async function requireAdmin() {
  return await requireRole([UserRole.ADMIN])
}

export async function requireSpecialUserOrAdmin() {
  return await requireRole([UserRole.SPECIAL_USER, UserRole.ADMIN])
}

export function canCreateCustomLinks(role: UserRole): boolean {
  return role === UserRole.SPECIAL_USER || role === UserRole.ADMIN
}

export function canCreateUnlimitedLinks(role: UserRole): boolean {
  return role === UserRole.SPECIAL_USER || role === UserRole.ADMIN
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN
}
