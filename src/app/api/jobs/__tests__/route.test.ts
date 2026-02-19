import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    job: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { POST, GET } from "../route"

const mockGetServerSession = vi.mocked(getServerSession)
const mockJobCreate = vi.mocked(prisma.job.create)

const TENANT_SESSION = {
  expires: "2099-01-01",
  user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1", email: "a@b.com", name: "管理者" },
}

const VALID_BODY = {
  title: "フロントエンドエンジニア",
  employmentType: "FULL_TIME",
  description: "React を使った開発",
  location: "東京",
  salaryMin: 500,
  salaryMax: 800,
  requirements: "React 経験2年以上",
  benefits: "フレックスタイム制",
}

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/jobs", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

describe("POST /api/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockJobCreate.mockResolvedValue({ id: "job-1", ...VALID_BODY } as never)
  })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it("tenantId がないユーザーは 403 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "SYSTEM_ADMIN", tenantId: null },
    })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(403)
  })

  it("正常なデータで求人が作成されて 201 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(201)
    expect(mockJobCreate).toHaveBeenCalledOnce()
  })

  it("作成時に tenantId がセッションから設定される", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    await POST(makeRequest(VALID_BODY))
    expect(mockJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: "tenant-1" }),
      })
    )
  })

  it("ステータスが DRAFT で作成される", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    await POST(makeRequest(VALID_BODY))
    expect(mockJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "DRAFT" }),
      })
    )
  })

  it("title が空の場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    const res = await POST(makeRequest({ ...VALID_BODY, title: "" }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("タイトル")
  })

  it("description が空の場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    const res = await POST(makeRequest({ ...VALID_BODY, description: "" }))
    expect(res.status).toBe(400)
  })

  it("無効な employmentType の場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    const res = await POST(makeRequest({ ...VALID_BODY, employmentType: "INVALID" }))
    expect(res.status).toBe(400)
  })

  it("オプション項目（location, salary, requirements, benefits）は null 可", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    const res = await POST(makeRequest({
      title: "エンジニア",
      employmentType: "FULL_TIME",
      description: "仕事内容",
    }))
    expect(res.status).toBe(201)
  })
})

describe("GET /api/jobs（公開モード）", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("認証不要で公開求人を取得できる", async () => {
    const req = new NextRequest("http://localhost/api/jobs")
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})

describe("GET /api/jobs?admin=true（管理者モード）", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = new NextRequest("http://localhost/api/jobs?admin=true")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("tenantId のないユーザーは 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "SYSTEM_ADMIN", tenantId: null },
    })
    const req = new NextRequest("http://localhost/api/jobs?admin=true")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("認証済みテナントユーザーは全ステータスの求人を取得できる", async () => {
    mockGetServerSession.mockResolvedValue(TENANT_SESSION)
    const req = new NextRequest("http://localhost/api/jobs?admin=true")
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})

