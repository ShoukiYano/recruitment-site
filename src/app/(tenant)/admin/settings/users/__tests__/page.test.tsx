import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockUpdate = vi.fn()

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}))

// global fetch をモック
vi.stubGlobal("fetch", mockFetch)

import { useSession } from "next-auth/react"
import UsersSettingsPage from "../page"

const mockUseSession = vi.mocked(useSession)

function makeSession(overrides: Partial<{ name: string; email: string; role: string }> = {}) {
  return {
    data: {
      expires: "2099-01-01",
      user: {
        id: "u1",
        name: "山田太郎",
        email: "yamada@example.com",
        role: "TENANT_ADMIN",
        tenantId: "tenant-1",
        ...overrides,
      },
    },
    status: "authenticated" as const,
    update: mockUpdate,
  }
}

describe("UsersSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ message: "OK" }) })
  })

  // --- 表示テスト ---

  it("セッションがない場合「読み込み中」を表示する", () => {
    mockUseSession.mockReturnValue({ data: null, status: "loading", update: mockUpdate })
    render(<UsersSettingsPage />)
    expect(screen.getByText("読み込み中...")).toBeInTheDocument()
  })

  it("ユーザー名が表示される", () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)
    expect(screen.getByText("山田太郎")).toBeInTheDocument()
  })

  it("メールアドレスが表示される", () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)
    expect(screen.getByDisplayValue("yamada@example.com")).toBeInTheDocument()
  })

  it("ロールバッジが表示される", () => {
    mockUseSession.mockReturnValue(makeSession({ role: "TENANT_ADMIN" }))
    render(<UsersSettingsPage />)
    expect(screen.getByText("企業管理者")).toBeInTheDocument()
  })

  it("SYSTEM_ADMIN ロールが正しく表示される", () => {
    mockUseSession.mockReturnValue(makeSession({ role: "SYSTEM_ADMIN" }))
    render(<UsersSettingsPage />)
    expect(screen.getByText("システム管理者")).toBeInTheDocument()
  })

  it("アバターに名前の頭文字が表示される", () => {
    mockUseSession.mockReturnValue(makeSession({ name: "田中花子" }))
    render(<UsersSettingsPage />)
    expect(screen.getByText("田")).toBeInTheDocument()
  })

  it("メールアドレスフィールドは無効化されている", () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)
    expect(screen.getByDisplayValue("yamada@example.com")).toBeDisabled()
  })

  it("保存ボタンは名前が変更されていないとき無効化されている", () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)
    expect(screen.getByRole("button", { name: /プロフィールを保存/ })).toBeDisabled()
  })

  // --- プロフィール更新テスト ---

  it("名前を変更すると保存ボタンが有効化される", async () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)

    const nameInput = screen.getByDisplayValue("山田太郎")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "新しい名前")

    expect(screen.getByRole("button", { name: /プロフィールを保存/ })).not.toBeDisabled()
  })

  it("プロフィール保存ボタンをクリックすると PATCH /api/users/me が呼ばれる", async () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)

    const nameInput = screen.getByDisplayValue("山田太郎")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "更新後の名前")

    await userEvent.click(screen.getByRole("button", { name: /プロフィールを保存/ }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/users/me", expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "更新後の名前" }),
      }))
    })
  })

  // --- パスワード変更テスト ---

  it("パスワード変更フィールドが表示される", () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)

    expect(screen.getByLabelText("現在のパスワード")).toBeInTheDocument()
    expect(screen.getByLabelText("新しいパスワード")).toBeInTheDocument()
    expect(screen.getByLabelText("新しいパスワード（確認）")).toBeInTheDocument()
  })

  it("パスワードが一致しない場合、APIは呼ばれない", async () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "oldpass123")
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "newpass123")
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "different456")

    await userEvent.click(screen.getByRole("button", { name: /パスワードを変更/ }))

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("パスワード変更ボタンをクリックすると PATCH /api/users/me/password が呼ばれる", async () => {
    mockUseSession.mockReturnValue(makeSession())
    render(<UsersSettingsPage />)

    await userEvent.type(screen.getByLabelText("現在のパスワード"), "oldpass123")
    await userEvent.type(screen.getByLabelText("新しいパスワード"), "newpass123")
    await userEvent.type(screen.getByLabelText("新しいパスワード（確認）"), "newpass123")

    await userEvent.click(screen.getByRole("button", { name: /パスワードを変更/ }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/users/me/password", expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ currentPassword: "oldpass123", newPassword: "newpass123" }),
      }))
    })
  })
})
