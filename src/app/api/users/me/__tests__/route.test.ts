import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("hashed"),
  },
}))

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { PATCH as patchMe } from "../route"
import { PATCH as patchPassword } from "../password/route"

const mockGetServerSession = vi.mocked(getServerSession)
const mockUserUpdate = vi.mocked(prisma.user.update)
const mockUserFindUnique = vi.mocked(prisma.user.findUnique)
const mockBcryptCompare = vi.mocked(bcrypt.compare)

function makeSession() {
  return {
    expires: "2099-01-01",
    user: { id: "u1", email: "test@example.com", name: "テスト", role: "TENANT_ADMIN", tenantId: "tenant-1" },
  }
}

// ---- PATCH /api/users/me ----
describe("PATCH /api/users/me", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = new Request("http://localhost/api/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "新しい名前" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchMe(req)
    expect(res.status).toBe(401)
  })

  it("名前を正常に更新できる", async () => {
    mockGetServerSession.mockResolvedValue(makeSession())
    const req = new Request("http://localhost/api/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "更新後の名前" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchMe(req)
    expect(res.status).toBe(200)
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "更新後の名前" },
    })
  })

  it("名前が空の場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(makeSession())
    const req = new Request("http://localhost/api/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name: "" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchMe(req)
    expect(res.status).toBe(400)
  })
})

// ---- PATCH /api/users/me/password ----
describe("PATCH /api/users/me/password", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("未認証の場合 401 を返す", async () => {
    mockGetServerSession.mockResolvedValue(null)
    const req = new Request("http://localhost/api/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "old", newPassword: "newpass123" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchPassword(req)
    expect(res.status).toBe(401)
  })

  it("現在のパスワードが正しくない場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(makeSession())
    mockUserFindUnique.mockResolvedValue({ passwordHash: "hashed" } as never)
    mockBcryptCompare.mockResolvedValue(false as never)

    const req = new Request("http://localhost/api/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "wrongpass", newPassword: "newpass123" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchPassword(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("正しくありません")
  })

  it("パスワードを正常に変更できる", async () => {
    mockGetServerSession.mockResolvedValue(makeSession())
    mockUserFindUnique.mockResolvedValue({ passwordHash: "hashed" } as never)
    mockBcryptCompare.mockResolvedValue(true as never)

    const req = new Request("http://localhost/api/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "oldpass123", newPassword: "newpass123" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchPassword(req)
    expect(res.status).toBe(200)
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "hashed" },
    })
  })

  it("新しいパスワードが8文字未満の場合 400 を返す", async () => {
    mockGetServerSession.mockResolvedValue(makeSession())
    const req = new Request("http://localhost/api/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "oldpass123", newPassword: "short" }),
      headers: { "Content-Type": "application/json" },
    })
    const res = await patchPassword(req)
    expect(res.status).toBe(400)
  })
})
