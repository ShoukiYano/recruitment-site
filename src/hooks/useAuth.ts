"use client"

import { useSession } from "next-auth/react"
import { AppRole } from "@/types/next-auth"

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const isSystemAdmin = user?.role === "SYSTEM_ADMIN"
  const isTenantAdmin = user?.role === "TENANT_ADMIN"
  const isTenantUser = user?.role === "TENANT_USER"
  const isJobSeeker = user?.role === "JOB_SEEKER"
  const isTenantMember = isTenantAdmin || isTenantUser

  function hasRole(role: AppRole): boolean {
    return user?.role === role
  }

  function canAccessTenant(tenantId: string): boolean {
    if (isSystemAdmin) return true
    return user?.tenantId === tenantId
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isSystemAdmin,
    isTenantAdmin,
    isTenantUser,
    isJobSeeker,
    isTenantMember,
    hasRole,
    canAccessTenant,
  }
}
