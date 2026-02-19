/**
 * PATCH /api/jobs/[id] のテスト
 * ※ [id] を含むパスは Vite が解決できないため、@/ エイリアスで import する
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { PATCH } from "@/app/api/jobs/[id]/route"

const mockGetServerSession = vi.mocked(getServerSession)
const mockJobFindUnique = vi.mocked(prisma.job.findUnique)
const mockJobUpdate = vi.mocked(prisma.job.update)

const TENANT_SESSION = {
  expires: "2099-01-01",
  user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1", email: "a@b.com", name: "管理者" },
}

function makePatchReq(id: string, body: object) {
  return new NextRequest(`http://localhost/api/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

describe("PATCH /api/jobs/[id]（ステータス切替）", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const res = await PATCH(makePatchReq("job-1", { status: "PUBLISHED" }), {
      params: Promise.resolve({ id: "job-1" }),
    })
    expect(res.status).toBe(401)
  })

  it("tenantId のないユーザーは 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "SYSTEM_ADMIN", tenantId: null },
    })
    const res = await PATCH(makePatchReq("job-1", { status: "PUBLISHED" }), {
      params: Promise.resolve({ id: "job-1" }),
    })
    expect(res.status).toBe(401)
  })

  it("存在しない求人は 404 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    mockJobFindUnique.mockResolvedValue(null)
    const res = await PATCH(makePatchReq("non-existent", { status: "PUBLISHED" }), {
      params: Promise.resolve({ id: "non-existent" }),
    })
    expect(res.status).toBe(404)
  })

  it("他テナントの求人は 403 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    mockJobFindUnique.mockResolvedValue({ tenantId: "other-tenant", status: "DRAFT" } as never)
    const res = await PATCH(makePatchReq("job-1", { status: "PUBLISHED" }), {
      params: Promise.resolve({ id: "job-1" }),
    })
    expect(res.status).toBe(403)
  })

  it("DRAFT → PUBLISHED に変更できる", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    mockJobFindUnique.mockResolvedValue({ tenantId: "tenant-1", status: "DRAFT" } as never)
    mockJobUpdate.mockResolvedValue({ id: "job-1", status: "PUBLISHED" } as never)
    const res = await PATCH(makePatchReq("job-1", { status: "PUBLISHED" }), {
      params: Promise.resolve({ id: "job-1" }),
    })
    expect(res.status).toBe(200)
    expect(mockJobUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "PUBLISHED" }) })
    )
  })

  it("PUBLISHED → DRAFT に変更できる", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    mockJobFindUnique.mockResolvedValue({ tenantId: "tenant-1", status: "PUBLISHED" } as never)
    mockJobUpdate.mockResolvedValue({ id: "job-1", status: "DRAFT" } as never)
    const res = await PATCH(makePatchReq("job-1", { status: "DRAFT" }), {
      params: Promise.resolve({ id: "job-1" }),
    })
    expect(res.status).toBe(200)
  })

  it("無効なステータスは 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    mockJobFindUnique.mockResolvedValue({ tenantId: "tenant-1", status: "DRAFT" } as never)
    const res = await PATCH(makePatchReq("job-1", { status: "INVALID" }), {
      params: Promise.resolve({ id: "job-1" }),
    })
    expect(res.status).toBe(400)
  })
})
