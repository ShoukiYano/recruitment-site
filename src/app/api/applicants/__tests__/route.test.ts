import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// getServerSession をモック
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

// prisma をモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}))

import { getServerSession } from "next-auth"
import { GET } from "../route"

const mockGetServerSession = vi.mocked(getServerSession)

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/applicants")
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url.toString())
}

describe("GET /api/applicants", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = makeRequest({ tenantId: "tenant-1" })
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it("tenantId がない場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1" },
    })
    const req = makeRequest({})
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it("他テナントにアクセスしようとすると 403 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1" },
    })
    const req = makeRequest({ tenantId: "tenant-2" })
    const res = await GET(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it("SYSTEM_ADMIN は他テナントにアクセス可能", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "SYSTEM_ADMIN", tenantId: null },
    })
    const req = makeRequest({ tenantId: "tenant-2" })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it("自テナントへのアクセスは 200 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1" },
    })
    const req = makeRequest({ tenantId: "tenant-1" })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
