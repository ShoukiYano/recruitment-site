import { describe, it, expect, vi, beforeEach } from "vitest"

// getServerSession をモック
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

// message-service をモック
vi.mock("@/lib/services/message-service", () => ({
  getMessagesByTenant: vi.fn().mockResolvedValue([]),
  getMessagesByJobSeeker: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn().mockResolvedValue({ id: "msg-1", content: "テスト" }),
}))

import { getServerSession } from "next-auth"
import { GET, POST } from "../route"

const mockGetServerSession = vi.mocked(getServerSession)

function makeRequest(method: "GET" | "POST", body?: object, searchParams?: Record<string, string>) {
  const url = new URL("http://localhost/api/messages")
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return new Request(url.toString(), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  })
}

describe("GET /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = makeRequest("GET")
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it("企業ユーザーのメッセージ一覧取得", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1" },
    })
    const req = makeRequest("GET")
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it("求職者のメッセージ一覧取得", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "js-1", role: "JOB_SEEKER", tenantId: null },
    })
    const req = makeRequest("GET")
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = makeRequest("POST", { applicationId: "app-1", content: "こんにちは" })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("企業ユーザーがメッセージ送信できる", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1" },
    })
    const req = makeRequest("POST", { applicationId: "app-1", content: "面接の件について" })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it("バリデーションエラー: content が空の場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "2099-01-01",
      user: { id: "u1", role: "TENANT_ADMIN", tenantId: "tenant-1" },
    })
    const req = makeRequest("POST", { applicationId: "app-1", content: "" })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
