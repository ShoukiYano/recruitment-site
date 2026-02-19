import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useAuth } from "../useAuth"

// next-auth/react をモック
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}))

import { useSession } from "next-auth/react"
import type { AppRole } from "@/types/next-auth"

const mockUseSession = vi.mocked(useSession)

function makeSession(role: AppRole, tenantId: string | null = null) {
  return {
    data: {
      expires: "2099-01-01",
      user: { id: "user-1", email: "test@example.com", name: "テスト", role, tenantId },
    },
    status: "authenticated" as const,
    update: vi.fn(),
  }
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("未認証の場合 isAuthenticated が false", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it("ローディング中は isLoading が true", () => {
    mockUseSession.mockReturnValue({ data: null, status: "loading", update: vi.fn() })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(true)
  })

  it("SYSTEM_ADMIN ロールの判定", () => {
    mockUseSession.mockReturnValue(makeSession("SYSTEM_ADMIN"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isSystemAdmin).toBe(true)
    expect(result.current.isTenantAdmin).toBe(false)
    expect(result.current.isTenantUser).toBe(false)
    expect(result.current.isJobSeeker).toBe(false)
  })

  it("TENANT_ADMIN ロールの判定", () => {
    mockUseSession.mockReturnValue(makeSession("TENANT_ADMIN", "tenant-1"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isTenantAdmin).toBe(true)
    expect(result.current.isTenantMember).toBe(true)
    expect(result.current.isSystemAdmin).toBe(false)
  })

  it("TENANT_USER ロールの判定", () => {
    mockUseSession.mockReturnValue(makeSession("TENANT_USER", "tenant-1"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isTenantUser).toBe(true)
    expect(result.current.isTenantMember).toBe(true)
  })

  it("JOB_SEEKER ロールの判定", () => {
    mockUseSession.mockReturnValue(makeSession("JOB_SEEKER"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isJobSeeker).toBe(true)
    expect(result.current.isTenantMember).toBe(false)
  })

  it("canAccessTenant: SYSTEM_ADMIN は全テナントにアクセス可", () => {
    mockUseSession.mockReturnValue(makeSession("SYSTEM_ADMIN"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.canAccessTenant("any-tenant")).toBe(true)
  })

  it("canAccessTenant: 自テナントにはアクセス可", () => {
    mockUseSession.mockReturnValue(makeSession("TENANT_ADMIN", "tenant-1"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.canAccessTenant("tenant-1")).toBe(true)
  })

  it("canAccessTenant: 他テナントにはアクセス不可", () => {
    mockUseSession.mockReturnValue(makeSession("TENANT_ADMIN", "tenant-1"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.canAccessTenant("tenant-2")).toBe(false)
  })

  it("hasRole が正しく動作する", () => {
    mockUseSession.mockReturnValue(makeSession("TENANT_ADMIN", "tenant-1"))
    const { result } = renderHook(() => useAuth())
    expect(result.current.hasRole("TENANT_ADMIN")).toBe(true)
    expect(result.current.hasRole("SYSTEM_ADMIN")).toBe(false)
  })
})
